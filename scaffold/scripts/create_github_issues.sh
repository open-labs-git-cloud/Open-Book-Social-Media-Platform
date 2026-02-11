#!/usr/bin/env bash
set -euo pipefail

# Create GitHub issues from markdown files in projects/openbook/stories
# Requires `gh` CLI to be installed and authenticated

STORIES_DIR="projects/openbook/stories"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not found. Install and authenticate (gh auth login) to create issues." >&2
  exit 1
fi

if [[ ! -d "$STORIES_DIR" ]]; then
  echo "No stories directory found at $STORIES_DIR" >&2
  exit 1
fi

for md in "$STORIES_DIR"/*.md; do
  [ -e "$md" ] || continue
  title=$(sed -n '1p' "$md" | sed 's/^#\s*//')
  body=$(sed -n '2,$p' "$md")
  echo "Creating issue: $title"
  gh issue create --title "$title" --body-file "$md" || echo "Failed to create issue for $md"
done

echo "Done. Check your repository issues." 
