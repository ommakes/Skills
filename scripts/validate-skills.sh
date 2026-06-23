#!/bin/bash

# Validate that all SKILL.md files have proper frontmatter
# Usage: ./scripts/validate-skills.sh

echo "🔍 Validating all skills..."
echo ""

failed=0
success=0

# Find all SKILL.md files
for skill_file in */SKILL.md; do
  if [ ! -f "$skill_file" ]; then
    continue
  fi

  skill_dir=$(dirname "$skill_file")

  # Extract frontmatter (between --- markers)
  frontmatter=$(sed -n '/^---$/,/^---$/p' "$skill_file" | sed '1d;$d')

  # Extract required fields
  name=$(echo "$frontmatter" | grep "^name:" | sed 's/^name:[ \t]*//' | xargs)
  version=$(echo "$frontmatter" | grep "^version:" | sed 's/^version:[ \t]*//' | xargs)
  description=$(echo "$frontmatter" | grep "^description:" | sed 's/^description:[ \t]*//' | xargs)

  # Validate required fields
  errors=()

  if [ -z "$name" ]; then
    errors+=("missing 'name' field")
  fi

  if [ -z "$version" ]; then
    errors+=("missing 'version' field")
  fi

  if [ -z "$description" ]; then
    errors+=("missing 'description' field")
  fi

  # Check version format (semantic versioning)
  if [ -n "$version" ] && ! [[ $version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    errors+=("version '$version' is not semantic versioning (X.Y.Z)")
  fi

  if [ ${#errors[@]} -gt 0 ]; then
    echo "❌ $skill_dir ($name)"
    for error in "${errors[@]}"; do
      echo "   └─ $error"
    done
    ((failed++))
  else
    echo "✅ $skill_dir: $name v$version"
    ((success++))
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Valid skills:   $success"
echo "Invalid skills: $failed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $failed -eq 0 ]; then
  echo "✨ All skills are valid!"
  exit 0
else
  echo "❌ Fix the errors above before publishing"
  exit 1
fi
