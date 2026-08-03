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

echo "Generated public/favicon-monika-v2.png from assets/icon.svg"
