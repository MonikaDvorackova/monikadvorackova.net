#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/assets/icon.svg"
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
magick "$tmpdir/favicon-16.png" "$tmpdir/favicon-32.png" "$tmpdir/favicon-48.png" "$PUBLIC/favicon-v3.ico"
cp "$PUBLIC/favicon-v3.ico" "$PUBLIC/favicon.ico"
cp "$SRC" "$PUBLIC/icon-v3.svg"
rsvg-convert -w 180 -h 180 "$SRC" -o "$PUBLIC/apple-icon-v3.png"

echo "Generated public/favicon-v3.ico, public/favicon.ico, public/icon-v3.svg, public/apple-icon-v3.png"
