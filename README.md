# ReadBot

ReadBot gives your AI coding tool newsletter digest commands. It connects to your email inbox, lets your AI summarize everything, and emails you a clean briefing.

It works with **Claude Code**, **OpenCode**, and any tool that supports markdown command files.

## How it works

ReadBot doesn't call any LLM API. Your AI tool *is* the LLM. ReadBot just:

1. Installs [Himalaya](https://github.com/pimalaya/himalaya) (a terminal email client)
2. Configures it with your IMAP/SMTP credentials
3. Drops two command files into your AI tool's commands directory

After setup, you get two commands:

- `/wake-up` — fetches unread newsletters, summarizes them, emails you a digest, marks them as read
- `/catch-up` — fetches *all* newsletters, summarizes them, emails you a digest (read-only, nothing marked)

The digest looks like this in your inbox:

```
🔴 Must Read
  - React 20 drops IE support — migration guide and breaking changes. React Blog

🟡 Worth Knowing
  - Bun 1.5 adds native S3 support
  - Node.js 24 enters LTS next month
  - New CSS anchor positioning lands in Firefox

⚪ Skipped
  - DevToolsWeekly — all sponsored content
```

## Setup

```bash
npx readbot-ai init
```

The wizard will:

1. **Detect your AI tool** (Claude Code, OpenCode, or ask for a path)
2. **Install Himalaya** if it's not already on your machine
3. **Ask for your email credentials** (IMAP/SMTP host, port, username, app password)
4. **Test the connection** to make sure it works
5. **Ask where to send digests** (which email address)
6. **Install the commands** into the right directory for your tool

That's it. Open your AI tool and run `/wake-up`.

### Gmail setup

If you use Gmail, you'll need an **App Password** (not your regular password):

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Generate a new app password for "Mail"
3. Use that 16-character password during setup

IMAP and SMTP are pre-filled for Gmail — just enter your email and app password.

### Other providers

ReadBot works with any email provider that supports IMAP/SMTP. You'll need:

| Setting | Typical value |
|---------|--------------|
| IMAP host | `imap.yourprovider.com` |
| IMAP port | `993` |
| SMTP host | `smtp.yourprovider.com` |
| SMTP port | `465` |

Check your provider's documentation for the exact values.

## Commands

### `/wake-up`

Morning briefing. Fetches unread emails, triages them into Must Read / Worth Knowing / Skip, sends an HTML digest to your inbox, marks processed emails as read, and saves a markdown copy locally.

### `/catch-up`

Full inbox scan. Same as wake-up but fetches all emails regardless of read status and does **not** mark anything as read. Use this when you've been away and want to catch up on everything.

## Other CLI commands

```bash
# Re-configure email credentials
readbot config

# Remove command files (keeps Himalaya installed)
readbot uninstall
```

## Supported tools

| Tool | Commands dir | Skills |
|------|-------------|--------|
| Claude Code | `~/.claude/commands/` | — |
| OpenCode | `~/.config/opencode/commands/` | `~/.config/opencode/skills/himalaya/` |
| Custom | You provide the path | — |

## Requirements

- Node.js 18+
- macOS, Linux, or Windows
- An email account with IMAP/SMTP access

## How the digest is built

ReadBot's command files are prompts. When you run `/wake-up`, your AI tool:

1. Runs `himalaya envelope list not flag seen` to find unread emails
2. Reads each email with `himalaya message read <id>`
3. Uses its own LLM to triage everything into three buckets
4. Builds an HTML email and sends it via `himalaya message send`
5. Marks emails as read and saves a markdown copy

The LLM cost comes from your AI tool's existing subscription or API key — ReadBot doesn't add any.

## License

MIT
