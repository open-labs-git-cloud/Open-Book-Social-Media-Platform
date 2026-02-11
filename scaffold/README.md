Scaffold and GitHub sync helpers for OpenBook
===========================================

Purpose
-------
This folder contains scaffolding resources and helper scripts to:

- Prepare a smaller subset of this repository for publishing to GitHub (exclude Supabase functions and Figma artifacts).
- Create GitHub issues from local markdown user-story files using the GitHub CLI (`gh`).

What to include when pushing to GitHub
-------------------------------------
Recommended set of files/paths to push to your public GitHub repo (edit as needed):

- src/                  (frontend application code)
- package.json
- src/styles/
- projects/openbook/    (documentation, user stories)
- scaffold/             (this folder)
- README.md

What to exclude
---------------
- supabase/             (Supabase functions and Deno server code)
- src/app/components/figma/  (raw Figma-generated components you do not want in the public repo)

Helper scripts
--------------
- `scripts/sync_to_github_subset.sh` creates a new branch, removes the paths you don't want on that branch, commits, and pushes to your configured remote (e.g., origin). It does not delete data from `main` — it creates a separate branch suitable for publishing.
- `scripts/create_github_issues.sh` reads markdown files from `projects/openbook/stories/` and, using the `gh` CLI, creates issues in the GitHub repository.

Usage examples
--------------
1) Prepare a branch with only desired files and push to GitHub:

```bash
# make sure working tree is clean
git status --porcelain

# run the helper (this creates branch 'github-sync' by default)
./scaffold/scripts/sync_to_github_subset.sh origin github-sync
```

2) Create issues on the remote repository (requires GitHub CLI authenticated):

```bash
./scaffold/scripts/create_github_issues.sh
```

Notes
-----
- These scripts modify branches and create commits. Review them before running and ensure you have pushed any important changes.
- The `create_github_issues.sh` script relies on `gh` being authenticated. It will skip creating issues if `gh` is not available.
