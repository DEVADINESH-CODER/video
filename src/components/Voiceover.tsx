import { useEffect, useRef, useState } from "react";
import { Audio, continueRender, delayRender, staticFile } from "remotion";

/**
 * Plays an episode's cloned voiceover if the file has already been generated.
 *
 * `public/audio/<episode>_voice.wav` is produced later by scripts/generate_voice.py
 * (or the voice-clone workflow), so a fresh clone of the repo has no audio yet.
 * Remotion would fail the render on a missing <Audio> source, so this probes the
 * file first and simply renders silence when it is not there.
 */
export const Voiceover: React.FC<{ src: string }> = ({ src }) => {
  const [handle] = useState(() => delayRender(`Probing voiceover ${src}`));
  const [available, setAvailable] = useState(false);
  const released = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const probe = async () => {
      const url = staticFile(src);
      let found = false;
      try {
        const head = await fetch(url, { method: "HEAD" });
        found = head.ok;
        // Some static servers reject HEAD; only then retry with a real GET.
        if (!found && (head.status === 405 || head.status === 501)) {
          const get = await fetch(url);
          found = get.ok;
        }
      } catch {
        found = false;
      }

      if (cancelled || released.current) {
        return;
      }
      released.current = true;
      setAvailable(found);
      continueRender(handle);
    };

    void probe();
    return () => {
      cancelled = true;
    };
  }, [handle, src]);

  if (!available) {
    return null;
  }

  return <Audio src={staticFile(src)} />;
};
