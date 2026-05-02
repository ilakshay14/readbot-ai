import fs from "node:fs";
import path from "node:path";
import { getHomedir } from "../utils/platform.js";

export type HimalayaConfig = {
  accountName: string;
  email: string;
  imapHost: string;
  imapPort: number;
  imapLogin: string;
  imapPassword: string;
  smtpHost: string;
  smtpPort: number;
  smtpLogin: string;
  smtpPassword: string;
  isGmail: boolean;
};

export function getConfigPath(): string {
  return path.join(getHomedir(), ".config", "himalaya", "config.toml");
}

export function configExists(): boolean {
  return fs.existsSync(getConfigPath());
}

export function generateConfigToml(config: HimalayaConfig): string {
  const lines = [
    `[accounts.${config.accountName}]`,
    `default = true`,
    `email = "${config.email}"`,
    ``,
  ];

  if (config.isGmail) {
    lines.push(
      `folder.aliases.inbox = "INBOX"`,
      `folder.aliases.sent = "[Gmail]/Sent Mail"`,
      `folder.aliases.drafts = "[Gmail]/Drafts"`,
      `folder.aliases.trash = "[Gmail]/Trash"`,
      ``
    );
  }

  lines.push(
    `backend.type = "imap"`,
    `backend.host = "${config.imapHost}"`,
    `backend.port = ${config.imapPort}`,
    `backend.login = "${config.imapLogin}"`,
    `backend.auth.type = "password"`,
    `backend.auth.raw = "${config.imapPassword}"`,
    ``,
    `message.send.backend.type = "smtp"`,
    `message.send.backend.host = "${config.smtpHost}"`,
    `message.send.backend.port = ${config.smtpPort}`,
    `message.send.backend.login = "${config.smtpLogin}"`,
    `message.send.backend.auth.type = "password"`,
    `message.send.backend.auth.raw = "${config.smtpPassword}"`
  );

  return lines.join("\n") + "\n";
}

export function writeConfig(config: HimalayaConfig): void {
  const configPath = getConfigPath();
  const configDir = path.dirname(configPath);

  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(configPath, generateConfigToml(config), { mode: 0o600 });
}
