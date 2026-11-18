#!/usr/bin/env bash
# Render one representative still per scene, then the full episode.
# Usage: bash scripts/render-keyframes.sh
set -euo pipefail

mkdir -p out/keyframes

for frame in 120 400 780 1240 1650; do
  npx remotion still Episode1 "out/keyframes/scene-${frame}.png" --frame="${frame}"
done

npx remotion render Episode1 out/episode1.mp4
