import fs from "node:fs";
import path from "node:path";
import { getHomedir } from "../utils/platform.js";

export type Tool = {
  name: string;
  commandsDir: string;
  skillsDir: string | null;
};

const TOOL_DEFINITIONS: Array<{
  name: string;
  signal: string;
  commandsDir: string;
  skillsDir: string | null;
}> = [
  {
    name: "Claude Code",
    signal: ".claude",
    commandsDir: path.join(getHomedir(), ".claude", "commands"),
    skillsDir: null,
  },
  {
    name: "OpenCode",
    signal: path.join(".config", "opencode"),
    commandsDir: path.join(getHomedir(), ".config", "opencode", "commands"),
    skillsDir: path.join(getHomedir(), ".config", "opencode", "skills"),
  },
];

export function detectTools(): Tool[] {
  const home = getHomedir();
  const detected: Tool[] = [];

  for (const def of TOOL_DEFINITIONS) {
    const signalPath = path.join(home, def.signal);
    if (fs.existsSync(signalPath)) {
      detected.push({
        name: def.name,
        commandsDir: def.commandsDir,
        skillsDir: def.skillsDir,
      });
    }
  }

  return detected;
}
