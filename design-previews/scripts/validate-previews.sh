#!/bin/bash

# Validate every design-previews HTML file has a valid @dsCard marker
# and references no external URLs (CDN scripts, fonts, images).
# Usage: ./design-previews/scripts/validate-previews.sh

set -u
cd "$(dirname "$0")/.." || exit 1

echo "🔍 Validating design previews..."
echo ""

failed=0
success=0

for file in foundations/*.html components/*.html patterns/*.html anti-patterns/*.html; do
  [ -f "$file" ] || continue

  errors=()

  first_line=$(head -n 1 "$file")
  if [[ ! "$first_line" =~ ^\<!--[[:space:]]@dsCard[[:space:]]group=\".+\"[[:space:]]--\>$ ]]; then
    errors+=("first line is not a valid <!-- @dsCard group=\"...\" --> marker")
  fi

  if grep -qE '(href|src)="(https?:)?//' "$file"; then
    errors+=("references an external URL (must be self-contained)")
  fi

  if [ ${#errors[@]} -gt 0 ]; then
    echo "❌ $file"
    for error in "${errors[@]}"; do
      echo "   └─ $error"
    done
    ((failed++))
  else
    echo "✅ $file"
    ((success++))
  fi
done

echo ""
echo "🔍 Checking tokens.css light/dark color pairing..."
echo ""

tokens_file="_shared/tokens.css"
light_colors=$(awk '/:root\.dark/{exit} /--color-[a-zA-Z0-9-]+:/{print}' "$tokens_file" | grep -oE -- '--color-[a-zA-Z0-9-]+' | sort -u)
dark_colors=$(awk '/:root\.dark/{f=1} f' "$tokens_file" | grep -oE -- '--color-[a-zA-Z0-9-]+' | sort -u)

missing_dark=()
for c in $light_colors; do
  if ! grep -qx -- "$c" <<< "$dark_colors"; then
    missing_dark+=("$c")
  fi
done

if [ ${#missing_dark[@]} -gt 0 ]; then
  echo "❌ $tokens_file"
  for c in "${missing_dark[@]}"; do
    echo "   └─ $c has a light value but no override inside :root.dark (violates DS-COLOR-006)"
  done
  ((failed++))
else
  echo "✅ $tokens_file — every --color-* token has a dark override"
  ((success++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "File counts (spot-check against README claims):"
for dir in foundations components patterns anti-patterns; do
  count=$(ls "$dir"/*.html 2>/dev/null | wc -l | tr -d ' ')
  echo "  $dir: $count"
done
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Valid previews:   $success"
echo "Invalid previews: $failed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$failed" -eq 0 ]; then
  echo "✨ All previews are valid!"
  exit 0
else
  echo "❌ Fix the errors above before syncing"
  exit 1
fi
