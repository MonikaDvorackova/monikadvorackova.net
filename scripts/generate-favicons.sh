#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/public/favicon.svg"
PUBLIC="$ROOT/public"

if [[ ! -f "$SRC" ]]; then
  echo "Missing source icon: $SRC" >&2
  exit 1
fi

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

rsvg-convert -w 16 -h 16 "$SRC" -o "$tmpdir/favicon-16.png"
rsvg-convert -w 32 -h 32 "$SRC" -o "$tmpdir/favicon-32.png"
rsvg-convert -w 48 -h 48 "$SRC" -o "$tmpdir/favicon-48.png"
magick "$tmpdir/favicon-16.png" -background none -alpha on PNG32:"$tmpdir/favicon-16.png"
magick "$tmpdir/favicon-32.png" -background none -alpha on PNG32:"$tmpdir/favicon-32.png"
magick "$tmpdir/favicon-48.png" -background none -alpha on PNG32:"$tmpdir/favicon-48.png"
magick "$tmpdir/favicon-16.png" "$tmpdir/favicon-32.png" "$tmpdir/favicon-48.png" "$PUBLIC/favicon.ico"
rsvg-convert -w 180 -h 180 "$SRC" -o "$PUBLIC/apple-touch-icon.png"
rsvg-convert -w 192 -h 192 "$SRC" -o "$PUBLIC/icon-192.png"
rsvg-convert -w 512 -h 512 "$SRC" -o "$PUBLIC/icon-512.png"

# Keep assets/icon.svg in sync as non-served source copy
mkdir -p "$ROOT/assets"
cp "$SRC" "$ROOT/assets/icon.svg"

echo "Generated favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png from public/favicon.svg"
