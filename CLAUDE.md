# Repository instructions for Claude Code

## Git workflow: push directly to `main`

This repository is owned by the association **BDE** (a GitHub account the
user, Silvio, set up so the project isn't tied to his personal account
forever). Silvio has collaborator/push access but switching between GitHub
accounts to approve/merge pull requests is painful for him.

**Standing instruction: always commit and push directly to `main`.**
- Do not create feature/working branches for changes in this repo.
- Do not open pull requests — they require a manual merge step Silvio wants
  to avoid entirely.
- This applies to all future work in this repository, overriding any
  default "always use a feature branch + PR" workflow, unless Silvio
  explicitly asks for a branch/PR for a specific change.

This is a deliberate, explicit choice made by a repo maintainer with push
access, not an oversight — don't ask for confirmation on this point again.
Still use ordinary care per change (readable commits, don't break the site),
since there's no PR/CI gate catching mistakes before they land on `main`.
