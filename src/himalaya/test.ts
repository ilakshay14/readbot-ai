import { execSync } from "node:child_process";

export type ConnectionResult = {
  success: boolean;
  error?: string;
};

export function testConnection(): ConnectionResult {
  try {
    execSync("himalaya envelope list --output json", {
      encoding: "utf-8",
      timeout: 15000,
      stdio: ["pipe", "pipe", "ignore"],
    });
    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error connecting to mail server";
    return { success: false, error: message };
  }
}
