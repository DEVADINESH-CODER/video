#!/usr/bin/env python3
"""Clone the narrator's voice and build one stitched voiceover per episode.

Reads episodes/<episode>/script.json, clones assets/my_voice_ref.wav with
Chatterbox TTS using each scene's own exaggeration / cfg_weight, joins the
clips with 400 ms of silence and writes:

    public/audio/<episode>_voice.wav      the finished voiceover
    public/audio/<episode>_timings.json   exact millisecond length per scene

Usage (GPU strongly recommended; a 30 s reference is enough):

    pip install chatterbox-tts pydub
    python scripts/generate_voice.py --episode ep01

The Remotion film picks the WAV up automatically: episodes/<episode>/config.ts
points its <Voiceover> at audio/<episode>_voice.wav and stays silent until the
file exists, so you can render picture before the voice is generated.
"""

from __future__ import annotations

import argparse
import json
import random
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PAUSE_MS = 400


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate a cloned voiceover for one episode.",
    )
    parser.add_argument(
        "--episode",
        default="ep01",
        help="Episode folder under episodes/ (default: ep01)",
    )
    parser.add_argument(
        "--reference",
        default=None,
        help="Voice sample to clone (default: voiceReference from script.json)",
    )
    parser.add_argument(
        "--output",
        default=None,
        help="Destination WAV (default: output from script.json)",
    )
    parser.add_argument(
        "--pause-ms",
        type=int,
        default=None,
        help=f"Silence between scenes in ms (default: script.json, else {DEFAULT_PAUSE_MS})",
    )
    parser.add_argument(
        "--device",
        default=None,
        help="cuda / mps / cpu (default: auto-detect)",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=None,
        help="Optional seed for repeatable takes",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    episode_dir = ROOT / "episodes" / args.episode
    script_path = episode_dir / "script.json"
    if not script_path.is_file():
        print(f"error: no script at {script_path.relative_to(ROOT)}", file=sys.stderr)
        return 1

    script: dict[str, Any] = json.loads(script_path.read_text(encoding="utf-8"))
    scenes: list[dict[str, Any]] = script.get("scenes", [])
    if not scenes:
        print(f"error: {script_path.relative_to(ROOT)} has no scenes", file=sys.stderr)
        return 1

    reference = Path(args.reference or script.get("voiceReference", "assets/my_voice_ref.wav"))
    if not reference.is_absolute():
        reference = ROOT / reference
    if not reference.is_file():
        print(
            f"error: voice reference missing at {reference.relative_to(ROOT)}\n"
            "       record ~30 s of clean speech and save it there, then re-run.",
            file=sys.stderr,
        )
        return 1

    output = Path(args.output or script.get("output") or f"public/audio/{args.episode}_voice.wav")
    if not output.is_absolute():
        output = ROOT / output
    pause_ms = args.pause_ms if args.pause_ms is not None else int(
        script.get("pauseMs", DEFAULT_PAUSE_MS)
    )

    try:
        import numpy as np
        import torch
        from chatterbox.tts import ChatterboxTTS
        from pydub import AudioSegment
    except ImportError as exc:  # pragma: no cover - environment problem
        print(
            f"error: missing dependency ({exc}).\n"
            "       pip install chatterbox-tts pydub",
            file=sys.stderr,
        )
        return 1

    if args.device:
        device = args.device
    elif torch.cuda.is_available():
        device = "cuda"
    elif getattr(torch.backends, "mps", None) and torch.backends.mps.is_available():
        device = "mps"
    else:
        device = "cpu"

    if args.seed is not None:
        random.seed(args.seed)
        np.random.seed(args.seed)
        torch.manual_seed(args.seed)
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(args.seed)

    print(f"voice   {reference.relative_to(ROOT)}")
    print(f"script  {script_path.relative_to(ROOT)}  ({len(scenes)} scenes)")
    print(f"device  {device}")
    print(f"out     {output.relative_to(ROOT)}  (pause {pause_ms} ms)\n")

    model = ChatterboxTTS.from_pretrained(device=device)
    sample_rate = int(model.sr)
    silence = AudioSegment.silent(duration=pause_ms, frame_rate=sample_rate)
    combined = AudioSegment.silent(duration=0, frame_rate=sample_rate)

    timings: list[dict[str, Any]] = []
    cursor_ms = 0

    for scene in scenes:
        number = int(scene.get("scene", len(timings) + 1))
        text = str(scene.get("narration", "")).strip()
        if not text:
            print(f"error: scene {number} has no narration", file=sys.stderr)
            return 1

        exaggeration = float(scene.get("exaggeration", 0.5))
        cfg_weight = float(scene.get("cfg_weight", 0.5))
        print(
            f"[{number}/{len(scenes)}] exaggeration={exaggeration:.2f} "
            f"cfg_weight={cfg_weight:.2f} · {text[:64]}"
        )

        generated = model.generate(
            text,
            audio_prompt_path=str(reference),
            exaggeration=exaggeration,
            cfg_weight=cfg_weight,
        )

        # Current chatterbox returns a (1, samples) tensor; streaming builds
        # yield chunks instead, so collect those into one waveform.
        if isinstance(generated, torch.Tensor):
            wav = generated
        else:
            chunks = [chunk for chunk in generated]
            wav = torch.cat(
                [
                    chunk if chunk.dim() == 2 else chunk.unsqueeze(0)
                    for chunk in chunks
                ],
                dim=-1,
            )

        samples = (
            wav.detach().to("cpu").float().squeeze(0).clamp(-1.0, 1.0).numpy()
        )
        pcm = (samples * 32767.0).astype("<i2").tobytes()
        clip = AudioSegment(
            data=pcm,
            sample_width=2,
            frame_rate=sample_rate,
            channels=1,
        )

        if timings:
            combined += silence
            cursor_ms += pause_ms
        combined += clip

        duration_ms = len(clip)
        timings.append(
            {
                "scene": number,
                "fromFrame": scene.get("fromFrame"),
                "durationInFrames": scene.get("durationInFrames"),
                "narration": text,
                "exaggeration": exaggeration,
                "cfg_weight": cfg_weight,
                "startMs": cursor_ms,
                "durationMs": duration_ms,
                "samples": len(samples),
            }
        )
        cursor_ms += duration_ms

    output.parent.mkdir(parents=True, exist_ok=True)
    combined.export(output, format="wav")

    timings_path = output.with_name(f"{args.episode}_timings.json")
    timings_path.write_text(
        json.dumps(
            {
                "episode": args.episode,
                "title": script.get("title"),
                "sampleRate": sample_rate,
                "channels": 1,
                "pauseMs": pause_ms,
                "totalDurationMs": len(combined),
                "voiceReference": str(reference.relative_to(ROOT)),
                "scenes": timings,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    print(f"\nvoiceover  {output.relative_to(ROOT)}  ({len(combined) / 1000:.2f} s)")
    print(f"timings    {timings_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
