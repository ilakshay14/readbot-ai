import { execSync } from "node:child_process";
import { detectPlatform } from "../utils/platform.js";

type HimalayaStatus = {
  installed: boolean;
  version: string | null;
};

export function checkHimalaya(): HimalayaStatus {
  try {
    const output = execSync("himalaya --version", { encoding: "utf-8" }).trim();
    const version = output.replace(/^himalaya\s*/i, "").trim() || output;
    return { installed: true, version };
  } catch {
    return { installed: false, version: null };
  }
}

export function installHimalaya(): boolean {
  const platform = detectPlatform();

  try {
    if (platform.os === "macos") {
      return installWithBrew();
    }

    return installFromGitHub(platform.os, platform.arch);
  } catch {
    return false;
  }
}

function installWithBrew(): boolean {
  try {
    execSync("which brew", { encoding: "utf-8" });
  } catch {
    throw new Error(
      "Homebrew not found. Install Himalaya manually: https://github.com/pimalaya/himalaya"
    );
  }

  execSync("brew install himalaya", { stdio: "inherit" });
  return true;
}

function installFromGitHub(os: "linux" | "windows", arch: "x64" | "arm64"): boolean {
  const archMap = { x64: "x86_64", arm64: "aarch64" };
  const osMap = { linux: "linux", windows: "windows" };
  const ext = os === "windows" ? "zip" : "tar.gz";
  const binary = `himalaya-${archMap[arch]}-${osMap[os]}.${ext}`;
  const url = `https://github.com/pimalaya/himalaya/releases/latest/download/${binary}`;

  if (os === "linux") {
    execSync(`curl -sL "${url}" | tar xz -C /usr/local/bin/`, { stdio: "inherit" });
  } else {
    throw new Error(
      "Automatic Windows install not supported. Download from: https://github.com/pimalaya/himalaya/releases"
    );
  }

  return true;
}
