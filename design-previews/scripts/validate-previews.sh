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
