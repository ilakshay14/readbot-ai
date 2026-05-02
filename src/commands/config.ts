import * as p from "@clack/prompts";
import {
  writeConfig,
  type HimalayaConfig,
} from "../himalaya/config.js";
import { testConnection } from "../himalaya/test.js";

function cancelled(): never {
  p.cancel("Cancelled.");
  process.exit(0);
}

export async function config() {
  p.intro("ReadBot — Reconfigure");

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
    message: "SMTP password:",
  });
  if (p.isCancel(smtpPassword)) cancelled();

  const accountName = await p.text({
    message: "Account name:",
    initialValue: "readbot",
  });
  if (p.isCancel(accountName)) cancelled();

  const himalayaConfig: HimalayaConfig = {
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

  writeConfig(himalayaConfig);
  p.log.success("Himalaya config updated");

  const spinner = p.spinner();
  spinner.start("Testing connection...");
  const result = testConnection();
  if (result.success) {
    spinner.stop("Connection successful");
  } else {
    spinner.stop("Connection failed");
    p.log.warn(result.error ?? "Could not connect");
  }

  p.outro("Config updated. Re-run readbot init to update command files.");
}
