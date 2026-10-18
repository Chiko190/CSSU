// Packs a ready-to-run copy into ../nc2-ready-to-run.zip: the built app, its runtime packages
// and a portable Node.js (Windows 64-bit), so the person receiving it installs nothing.
// Secrets (.env.local) are left out; the launcher creates a demo-mode one on first run.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readdirSync, realpathSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, relative, sep } from "node:path";

const root = join(import.meta.dirname, "..");
const parent = join(root, "..");
const name = basename(root);
const staging = join(parent, `${name}-ready-build`);
const target = join(staging, name);
const out = join(parent, `${name}-ready-to-run.zip`);
const tar = join(process.env.SystemRoot ?? "C:\\Windows", "System32", "tar.exe");

const step = (msg) => console.log(`\n> ${msg}`);

function run(command, cwd) {
  const result = spawnSync(command, { cwd, stdio: "inherit", shell: true });
  if (result.status !== 0) {
    console.error(`\n"${command}" failed. See the messages above.`);
    process.exit(1);
  }
}

if (process.platform !== "win32") {
  console.error("This builds a Windows bundle and has to run on Windows.");
  process.exit(1);
}

step("Building the app");
run("npx next build", root);

step("Copying files");
rmSync(staging, { recursive: true, force: true });
const skip = new Set(["node_modules", ".env.local", ".vercel", ".git", ".data", ".assets-backup", ".claude", "tsconfig.tsbuildinfo"]);
cpSync(root, target, {
  recursive: true,
  filter: (src) => {
    const rel = relative(root, src);
    if (!rel) return true;
    const parts = rel.split(sep);
    if (skip.has(parts[0]) || rel.endsWith(".zip")) return false;
    // .next/node_modules holds symlinks into ../node_modules; replaced with real copies below.
    return !(parts[0] === ".next" && ["cache", "dev", "node_modules"].includes(parts[1]));
  },
});
writeFileSync(join(target, ".prebuilt"), "Packages and build are included; RUN.bat skips installing and building.\n");

step("Installing runtime packages");
run("npm ci --omit=dev --no-audit --no-fund", target);

// The build links external server packages (e.g. firebase-admin) by absolute path, which would
// break on another machine, so put real copies of them there instead.
const linkDir = join(root, ".next", "node_modules");
for (const entry of existsSync(linkDir) ? readdirSync(linkDir) : []) {
  const pkg = relative(join(root, "node_modules"), realpathSync(join(linkDir, entry)));
  cpSync(join(target, "node_modules", pkg), join(target, ".next", "node_modules", entry), { recursive: true });
}

step(`Adding portable Node.js ${process.version}`);
const dist = `https://nodejs.org/dist/${process.version}`;
const nodeZipName = `node-${process.version}-win-x64.zip`;
const [zipRes, sumsRes] = await Promise.all([fetch(`${dist}/${nodeZipName}`), fetch(`${dist}/SHASUMS256.txt`)]);
if (!zipRes.ok || !sumsRes.ok) {
  console.error(`Could not download Node.js from ${dist}`);
  process.exit(1);
}
const nodeZip = Buffer.from(await zipRes.arrayBuffer());
const expected = (await sumsRes.text()).split("\n").find((l) => l.endsWith(`  ${nodeZipName}`))?.split(" ")[0];
if (createHash("sha256").update(nodeZip).digest("hex") !== expected) {
  console.error("Downloaded Node.js does not match its published checksum.");
  process.exit(1);
}
const nodeZipPath = join(staging, nodeZipName);
writeFileSync(nodeZipPath, nodeZip);
const unpack = join(staging, "node-unpack");
mkdirSync(unpack);
run(`"${tar}" -xf "${nodeZipPath}" -C "${unpack}"`, staging);
renameSync(join(unpack, readdirSync(unpack)[0]), join(target, "node"));

step("Creating the zip");
if (existsSync(out)) rmSync(out);
run(`"${tar}" -a -c -f "${out}" -C "${staging}" ${name}`, staging);
rmSync(staging, { recursive: true, force: true });
console.log(`\nDone: ${out}`);
