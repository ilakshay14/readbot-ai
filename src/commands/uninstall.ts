import fs from "node:fs";
import path from "node:path";
import * as p from "@clack/prompts";
import { detectTools } from "../detect/tool.js";
import { getConfigPath } from "../himalaya/config.js";

export async function uninstall() {
  p.intro("ReadBot — Uninstall");

  const tools = detectTools();
  let removed = 0;

  for (const tool of tools) {
    for (const file of ["wake-up.md", "catch-up.md"]) {
      const filePath = path.join(tool.commandsDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        p.log.info(`Removed ${filePath}`);
        removed++;
      }
    }

    if (tool.skillsDir) {
      const skillPath = path.join(tool.skillsDir, "himalaya", "SKILL.md");
      if (fs.existsSync(skillPath)) {
        fs.unlinkSync(skillPath);
        const skillDir = path.dirname(skillPath);
        try {
          fs.rmdirSync(skillDir);
        } catch {
          // directory not empty, leave it
        }
        p.log.info(`Removed himalaya skill from ${tool.name}`);
        removed++;
      }
    }
  }

  if (removed === 0) {
    p.log.warn("No ReadBot command files found to remove.");
  }

  const removeConfig = await p.confirm({
    message: "Also remove Himalaya config?",
    initialValue: false,
  });

  if (!p.isCancel(removeConfig) && removeConfig) {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
      p.log.info("Removed Himalaya config");
    }
  }

  p.outro("ReadBot removed. Himalaya CLI was left installed.");
}
