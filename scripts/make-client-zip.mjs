// Packs this project into ../nc2-for-client.zip for handing to someone else.
// Leaves out installed packages, build output, local data and secrets (.env.local);
// the launcher recreates all of those on the client's machine.
import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { basename, join } from "node:path";

const root = join(import.meta.dirname, "..");
const parent = join(root, "..");
const name = basename(root);
const out = join(parent, `${name}-for-client.zip`);

const exclude = [
  "node_modules",
  ".next",
  ".env.local",
  ".vercel",
  ".git",
  ".data",
  ".assets-backup",
  ".claude",
  "tsconfig.tsbuildinfo",
  "*.zip",
];

// Windows' own tar (bsdtar) writes zip files; Git Bash's GNU tar can't.
const tar = process.platform === "win32" ? join(process.env.SystemRoot ?? "C:\Windows", "System32", "tar.exe") : "tar";

if (existsSync(out)) rmSync(out);
console.log(`Creating ${out} ...`);
const result = spawnSync(
  tar,
  ["-a", "-c", "-f", out, ...exclude.flatMap((p) => ["--exclude", p]), "-C", parent, name],
  { stdio: "inherit" },
);
if (result.status !== 0) {
  console.error("\nCould not create the zip. See the messages above.");
  process.exit(1);
}
console.log("Done. Send that zip to the client.");
