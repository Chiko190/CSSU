// One-command local launcher used by RUN.bat / DEV.bat.
// Creates .env.local (demo mode), installs packages, builds when the source changed,
// then starts the app and opens the browser. Pass --dev to run the hot-reload dev server instead.
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { copyFileSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const dev = process.argv.includes("--dev");
const DEV_FALLBACK_SECRET = "dev-only-insecure-secret-change-me";

// Present in the ready-to-run zip (scripts/make-ready-zip.mjs): packages and build are already included.
const prebuilt = existsSync(join(root, ".prebuilt"));
if (prebuilt && dev) {
  console.error("This copy is pre-built and has no dev tools, so --dev isn't available. Use RUN.bat.");
  process.exit(1);
}

const step = (msg) => console.log(`\n> ${msg}`);
const ok = (msg) => console.log(`  [OK] ${msg}`);

function run(command) {
  const result = spawnSync(command, { cwd: root, stdio: "inherit", shell: true });
  if (result.status !== 0) {
    console.error(`\n"${command}" failed. See the messages above.`);
    process.exit(1);
  }
}

function mtime(path) {
  try {
    return statSync(path).mtimeMs;
  } catch {
    return 0;
  }
}

function newestMtime(path) {
  let newest = mtime(path);
  if (!existsSync(path) || !statSync(path).isDirectory()) return newest;
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    newest = Math.max(newest, newestMtime(join(path, entry.name)));
  }
  return newest;
}

function portIsFree(port) {
  return new Promise((resolve) => {
    const server = createServer()
      .once("error", () => resolve(false))
      .once("listening", () => server.close(() => resolve(true)))
      .listen(port);
  });
}

// --- 1. .env.local ------------------------------------------------------------
step("Checking settings (.env.local)");
const envPath = join(root, ".env.local");
if (!existsSync(envPath)) {
  copyFileSync(join(root, ".env.local.example"), envPath);
  ok("Created .env.local in demo mode");
}
// Production mode refuses the public dev secret, so give each install its own random one.
const env = readFileSync(envPath, "utf8");
const secretLine = env.match(/^SESSION_SECRET=(.*)$/m);
if (!secretLine || !secretLine[1].trim() || secretLine[1].trim() === DEV_FALLBACK_SECRET) {
  const line = `SESSION_SECRET=${randomBytes(32).toString("hex")}`;
  writeFileSync(envPath, secretLine ? env.replace(/^SESSION_SECRET=.*$/m, line) : `${env.trimEnd()}\n${line}\n`);
  ok("Generated a session secret");
} else {
  ok("Settings ready");
}

// --- 2. Packages ------------------------------------------------------------------
step("Checking packages");
const installedMarker = join(root, "node_modules", ".package-lock.json");
if (prebuilt) {
  ok("Packages included");
} else if (!existsSync(installedMarker) || mtime(join(root, "package-lock.json")) > mtime(installedMarker)) {
  console.log("  Installing packages (first run takes a few minutes)...");
  run("npm install --no-audit --no-fund");
  ok("Packages installed");
} else {
  ok("Packages already installed");
}

// --- 3. Build (production mode only) ---------------------------------------------
if (!dev && !prebuilt) {
  step("Checking build");
  const buildId = join(root, ".next", "BUILD_ID");
  const sourceChanged = Math.max(
    newestMtime(join(root, "src")),
    newestMtime(join(root, "public")),
    mtime(join(root, "package.json")),
    mtime(join(root, "next.config.ts")),
    mtime(envPath),
  );
  if (!existsSync(buildId) || sourceChanged > mtime(buildId)) {
    console.log("  Building the app (only needed after changes, takes a minute or two)...");
    run("npx next build");
    ok("Build finished");
  } else {
    ok("Build is up to date");
  }
}

// --- 4. Start ------------------------------------------------------------------------
let port = 3000;
while (!(await portIsFree(port))) port++;
const url = `http://localhost:${port}`;

step(`Starting the app at ${url}`);
console.log("  Keep this window open while you use the app. Close it (or press Ctrl+C) to stop.\n");

const server = spawn(`npx next ${dev ? "dev" : "start"} -p ${port}`, {
  cwd: root,
  stdio: "inherit",
  shell: true,
});
server.on("exit", (code) => process.exit(code ?? 0));

// Open the browser once the server answers.
for (let i = 0; i < 120; i++) {
  try {
    await fetch(url);
    spawn("cmd", ["/c", "start", "", url], { stdio: "ignore", detached: true }).unref();
    break;
  } catch {
    await new Promise((r) => setTimeout(r, 1000));
  }
}
