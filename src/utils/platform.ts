import os from "node:os";

export type Platform = {
  os: "macos" | "linux" | "windows";
  arch: "x64" | "arm64";
};

export function detectPlatform(): Platform {
  const platform = process.platform;
  const arch = process.arch;

  const osMap: Record<string, Platform["os"]> = {
    darwin: "macos",
    linux: "linux",
    win32: "windows",
  };

  const archMap: Record<string, Platform["arch"]> = {
    x64: "x64",
    arm64: "arm64",
  };

  const detectedOs = osMap[platform];
  if (!detectedOs) {
    throw new Error(`Unsupported OS: ${platform}`);
  }

  const detectedArch = archMap[arch] ?? "x64";

  return { os: detectedOs, arch: detectedArch };
}

export function getHomedir(): string {
  return os.homedir();
}
