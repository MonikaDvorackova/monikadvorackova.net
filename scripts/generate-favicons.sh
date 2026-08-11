#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/assets/icon.svg"
PUBLIC="$ROOT/public"

if [[ ! -f "$SRC" ]]; then
  echo "Missing source icon: $SRC" >&2
  exit 1
fi

rsvg-convert -w 192 -h 192 "$SRC" -o "$PUBLIC/favicon-monika-v2.png"

# Well-known /favicon.ico path (browsers + Googlebot default). Same beige artwork.
if command -v magick >/dev/null 2>&1; then
  magick "$PUBLIC/favicon-monika-v2.png" -define icon:auto-resize=16,32,48 "$PUBLIC/favicon.ico"
elif command -v convert >/dev/null 2>&1; then
  convert "$PUBLIC/favicon-monika-v2.png" -define icon:auto-resize=16,32,48 "$PUBLIC/favicon.ico"
else
  echo "Warning: ImageMagick not found; skipped favicon.ico generation" >&2
fi

echo "Generated public/favicon-monika-v2.png and public/favicon.ico from assets/icon.svg"
