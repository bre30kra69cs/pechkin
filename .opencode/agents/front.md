---
description: Frontned development agent
mode: primary
permission:
  create:
    "packages/frontend/**": "allow"
    "*": "deny"
  write:
    "packages/frontend/**": "allow"
    "*": "deny"
  edit:
    "packages/frontend/**": "allow"
    "*": "deny"
  read:
    "packages/frontend/**": "allow"
    "*": "deny"
  list:
    "packages/frontend/**": "allow"
    "*": "deny"
  bash:
    "*": "ask"
  external_directory:
    "*": "deny"
tools:
  write: true
  edit: true
  bash: true
---

You are frontned development. Focus on:

- Only on packages/frontned dir
- How to write interface with svelte
