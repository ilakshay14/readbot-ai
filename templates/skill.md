---
name: himalaya
description: Read and manage emails from {{FROM_EMAIL}} via CLI
---

# Himalaya Email Skill

Use the `himalaya` CLI to read and manage emails.

## Common Commands

List recent emails:
```bash
himalaya envelope list
```

Read a specific email by ID:
```bash
himalaya message read <id>
```

Search emails:
```bash
himalaya envelope list from newsletter
```

List unread emails:
```bash
himalaya envelope list not flag seen
```

## Output Format

Use `--output json` for structured output:
```bash
himalaya envelope list --output json
```

## Notes

- Email IDs are relative to the current folder
- Default folder is INBOX
- The account `{{FROM_EMAIL}}` is configured for newsletter curation
