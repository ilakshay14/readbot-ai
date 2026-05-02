import fs from "node:fs";
import path from "node:path";
import * as p from "@clack/prompts";
import { detectTools, type Tool } from "../detect/tool.js";
import { checkHimalaya, installHimalaya } from "../detect/himalaya.js";
import {
  writeConfig,
  configExists,
  type HimalayaConfig,
} from "../himalaya/config.js";
import { testConnection } from "../himalaya/test.js";

const TEMPLATES_DIR = path.join(
  path.dirname(process.argv[1]),
  "..",
  "templates"
);

function renderTemplate(
  template: string,
  values: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replaceAll(key, value);
  }
  return result;
}

function cancelled(): never {
  p.cancel("Setup cancelled.");
  process.exit(0);
}

export async function init() {
  p.intro("ReadBot Setup");

  // 1. Detect AI tool
  const tools = detectTools();
  let tool: Tool;

  if (tools.length === 0) {
    p.log.warn("No supported AI tool detected.");
    const dir = await p.text({
      message: "Enter the path to your commands directory:",
      placeholder: "~/.claude/commands",
      validate: (v) => (v.length === 0 ? "Path is required" : undefined),
    });
    if (p.isCancel(dir)) cancelled();
    tool = { name: "Custom", commandsDir: dir, skillsDir: null };
  } else if (tools.length === 1) {
    tool = tools[0];
    p.log.success(`Detected ${tool.name}`);
  } else {
    const selected = await p.select({
      message: "Multiple AI tools detected. Which one?",
      options: tools.map((t) => ({ value: t, label: t.name })),
    });
    if (p.isCancel(selected)) cancelled();
    tool = selected;
  }

  // 2. Check / install Himalaya
  const hStatus = checkHimalaya();
  if (hStatus.installed) {
    p.log.success(`Himalaya ${hStatus.version} found`);
  } else {
    const shouldInstall = await p.confirm({
      message: "Himalaya CLI not found. Install it?",
    });
    if (p.isCancel(shouldInstall) || !shouldInstall) {
      p.cancel("Himalaya is required for ReadBot.");
      process.exit(1);
    }

    const spinner = p.spinner();
    spinner.start("Installing Himalaya...");
    try {
      installHimalaya();
      spinner.stop("Himalaya installed");
    } catch (err) {
      spinner.stop("Installation failed");
      p.log.error(
        err instanceof Error ? err.message : "Failed to install Himalaya"
      );
      process.exit(1);
    }
  }

  // 3. Configure Himalaya (IMAP/SMTP)
  if (configExists()) {
    const action = await p.select({
      message: "Himalaya config already exists.",
      options: [
        { value: "overwrite", label: "Overwrite with new config" },
        { value: "skip", label: "Keep existing config" },
      ],
    });
    if (p.isCancel(action)) cancelled();
    if (action === "skip") {
      p.log.info("Keeping existing Himalaya config");
    } else {
      await configureHimalaya();
    }
  } else {
    await configureHimalaya();
  }

  // 4. Test connection
  const spinner = p.spinner();
  spinner.start("Testing IMAP connection...");
  const result = testConnection();
  if (result.success) {
    spinner.stop("Connection successful");
  } else {
    spinner.stop("Connection failed");
    p.log.warn(result.error ?? "Could not connect to mail server");
    p.log.info("You can fix this later by running: readbot config");
  }

  // 5. ReadBot-specific config
  const toEmail = await p.text({
    message: "Send digests to (email address):",
    placeholder: "you@example.com",
    validate: (v) =>
      v.includes("@") ? undefined : "Enter a valid email address",
  });
  if (p.isCancel(toEmail)) cancelled();

  const fromEmail = await p.text({
    message: "Send digests from (email address):",
    initialValue: toEmail,
    validate: (v) =>
      v.includes("@") ? undefined : "Enter a valid email address",
  });
  if (p.isCancel(fromEmail)) cancelled();

  const savePath = await p.text({
    message: "Local save path for markdown digests (optional):",
    placeholder: "~/Documents/Newsletter-Briefings",
    defaultValue: "~/Documents/Newsletter-Briefings",
  });
  if (p.isCancel(savePath)) cancelled();

  // 6. Install command files
  const replacements: Record<string, string> = {
    "{{FROM_EMAIL}}": fromEmail,
    "{{TO_EMAIL}}": toEmail,
    "{{TOOL_NAME}}": tool.name,
    "{{SAVE_PATH}}": savePath || "~/Documents/Newsletter-Briefings",
  };

  fs.mkdirSync(tool.commandsDir, { recursive: true });

  for (const file of ["wake-up.md", "catch-up.md"]) {
    const destPath = path.join(tool.commandsDir, file);

    if (fs.existsSync(destPath)) {
      const overwrite = await p.confirm({
        message: `${file} already exists. Overwrite?`,
      });
      if (p.isCancel(overwrite) || !overwrite) continue;
    }

    const template = fs.readFileSync(path.join(TEMPLATES_DIR, file), "utf-8");
    fs.writeFileSync(destPath, renderTemplate(template, replacements));
    p.log.success(`Installed ${file}`);
  }

  // Install skill file if supported
  if (tool.skillsDir) {
    const skillDir = path.join(tool.skillsDir, "himalaya");
    fs.mkdirSync(skillDir, { recursive: true });
    const skillTemplate = fs.readFileSync(
      path.join(TEMPLATES_DIR, "skill.md"),
      "utf-8"
    );
    fs.writeFileSync(
      path.join(skillDir, "SKILL.md"),
      renderTemplate(skillTemplate, replacements)
    );
    p.log.success("Installed himalaya skill");
  }

  // Ensure save directory exists
  const expandedSavePath = (savePath || "~/Documents/Newsletter-Briefings").replace(
    "~",
    process.env.HOME ?? ""
  );
  fs.mkdirSync(expandedSavePath, { recursive: true });

  p.outro(
    `Done! Run /wake-up from ${tool.name} to get your first newsletter digest.`
  );
}

async function configureHimalaya() {
  const isGmail = await p.confirm({
    message: "Is this a Gmail account?",
    initialValue: true,
  });
  if (p.isCancel(isGmail)) cancelled();

  const imapHost = await p.text({
    message: "IMAP host:",
    initialValue: isGmail ? "imap.gmail.com" : "",
  });
  if (p.isCancel(imapHost)) cancelled();

  const imapPort = await p.text({
    message: "IMAP port:",
    initialValue: "993",
  });
  if (p.isCancel(imapPort)) cancelled();

  const imapLogin = await p.text({
    message: "Email / username:",
    placeholder: "you@gmail.com",
  });
  if (p.isCancel(imapLogin)) cancelled();

  const imapPassword = await p.password({
    message: "App password:",
  });
  if (p.isCancel(imapPassword)) cancelled();

  const smtpHost = await p.text({
    message: "SMTP host:",
    initialValue: isGmail ? "smtp.gmail.com" : "",
  });
  if (p.isCancel(smtpHost)) cancelled();

  const smtpPort = await p.text({
    message: "SMTP port:",
    initialValue: "465",
  });
  if (p.isCancel(smtpPort)) cancelled();

  const smtpLogin = await p.text({
    message: "SMTP login:",
    initialValue: imapLogin,
  });
  if (p.isCancel(smtpLogin)) cancelled();

  const smtpPassword = await p.password({
    message: "SMTP password (same as above if Gmail):",
  });
  if (p.isCancel(smtpPassword)) cancelled();

  const accountName = await p.text({
    message: "Account name:",
    initialValue: "readbot",
  });
  if (p.isCancel(accountName)) cancelled();

  const config: HimalayaConfig = {
    accountName,
    email: imapLogin,
    imapHost,
    imapPort: Number(imapPort),
    imapLogin,
    imapPassword,
    smtpHost,
    smtpPort: Number(smtpPort),
    smtpLogin,
    smtpPassword,
    isGmail,
  };

  writeConfig(config);
  p.log.success("Himalaya configured");
}
