#!/usr/bin/env bash
set -euo pipefail

# Usage: ./sync_to_github_subset.sh <remote> <branch>
# Example: ./sync_to_github_subset.sh origin github-sync

REMOTE=${1:-origin}
BRANCH=${2:-github-sync}

echo "Preparing branch '$BRANCH' to push a curated subset to remote '$REMOTE'"

# Ensure working tree is clean
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree not clean. Commit or stash changes before running this script." >&2
  exit 1
fi

# Create and switch to branch
git switch -c "$BRANCH"

echo "Removing unwanted paths from this branch (supabase/, src/app/components/figma/)"
# Remove tracked files from undesired folders on this branch only
git rm -r --cached --ignore-unmatch supabase || true
git rm -r --cached --ignore-unmatch src/app/components/figma || true

# Optionally add any other paths you want to exclude by editing the list above

git commit -m "chore(sync): remove supabase and figma artifacts for public sync" || echo "No changes to commit"

echo "Pushing branch '$BRANCH' to remote '$REMOTE'"
git push -u "$REMOTE" "$BRANCH"

echo "Done. You can create a PR from $BRANCH to main or use $BRANCH as the public repo branch." 
