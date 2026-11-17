// Adds a spoken voice-over to the app's own lesson videos, using the lines in narration.cjs.
// Each line is spoken by a Microsoft neural voice (through the free Edge "read aloud" service --
// needs internet while it runs; the finished videos play offline), placed at the moment its caption
// appears, and mixed into one Opus audio track. The video picture is copied untouched.
//
//   Run from the project folder:
//     FFMPEG=<ffmpeg.exe> FFPROBE=<ffprobe.exe> node scripts/lesson-videos/narrate.mjs [video ...]
//   e.g.  node scripts/lesson-videos/narrate.mjs module-2/videos/intro
//   With no arguments every video in narration.cjs is narrated.
//
// Tools (none are project dependencies): any ffmpeg/ffprobe build (e.g. the ffmpeg-static and
// ffprobe-static npm packages), and msedge-tts -- install it next to this script's run with
// `npm i --no-save msedge-tts@2.1.1`, or set MSEDGE_TTS to the folder of an existing install.
//
// Safe to re-run: any old audio track is replaced, never doubled. Re-run it after re-rendering a
// video with lan-cable-videos.cjs, since that writes a silent file.
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { mkdirSync, renameSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const NARRATION = require("./narration.cjs");

const VOICE = "en-US-AndrewNeural"; // warm, natural male voice
const ROOT = path.join(import.meta.dirname, "../..");
const VIDEOS = path.join(ROOT, "public/modules");
const LEAD = 0.15; // start speaking just after the caption fades in
const GAP = 0.3; // leave this much silence before the next caption's line
const RATES = [0, 8, 16, 24, 30]; // % faster, tried in order until a line fits its slot

const FFMPEG = process.env.FFMPEG;
const FFPROBE = process.env.FFPROBE;
if (!FFMPEG || !FFPROBE) {
  console.error("Set FFMPEG and FFPROBE to the paths of ffmpeg and ffprobe executables.");
  process.exit(1);
}

const ttsModule = process.env.MSEDGE_TTS ? pathToFileURL(path.join(process.env.MSEDGE_TTS, "dist/index.js")).href : "msedge-tts";

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", ...opts });
  if (r.status !== 0) throw new Error(`${path.basename(cmd)} failed:\n${r.stderr}`);
  return r.stdout;
}

const duration = (file) => Number(run(FFPROBE, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).trim());

// Each line is synthesized in its own short-lived Node process: msedge-tts throws from a stale
// connection's close event when one instance outlives a request, which would crash a long run.
const SPEAK = `
  const m = await import(process.env.TTS_MODULE);
  const { MsEdgeTTS, OUTPUT_FORMAT } = m.default ?? m;
  const tts = new MsEdgeTTS();
  await tts.setMetadata(process.env.TTS_VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
  await tts.toFile(process.env.TTS_DIR, process.env.TTS_TEXT, { rate: process.env.TTS_RATE });
  process.exit(0);`;

function speak(text, rate, dir) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const env = { ...process.env, TTS_MODULE: ttsModule, TTS_VOICE: VOICE, TTS_DIR: dir, TTS_TEXT: text, TTS_RATE: `+${rate}%` };
  for (let attempt = 1; ; attempt++) {
    try {
      run(process.execPath, ["--input-type=module", "-e", SPEAK], { env, timeout: 60_000 });
      return path.join(dir, "audio.mp3");
    } catch (err) {
      // The free service occasionally drops a request, more often under load -- back off and retry.
      if (attempt >= 8) throw err;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, attempt * 10_000);
    }
  }
}

async function narrate(key) {
  const lines = NARRATION[key];
  if (!lines) throw new Error(`No narration for ${key} -- see narration.cjs`);
  const video = path.join(VIDEOS, `${key}.webm`);
  const videoLen = duration(video);
  const work = path.join(tmpdir(), "nc2-narration", key.replaceAll("/", "_"));

  const clips = [];
  for (const [i, line] of lines.entries()) {
    const start = line.at + LEAD;
    const end = (lines[i + 1]?.at ?? videoLen) - GAP;
    const slot = end - start;
    let fitted = null;
    for (const rate of RATES) {
      const file = speak(line.text, rate, path.join(work, String(i)));
      const len = duration(file);
      if (len <= slot) {
        fitted = { file, start, len, rate };
        break;
      }
    }
    if (!fitted) throw new Error(`${key} line ${i + 1} is too long for its ${slot.toFixed(1)} s slot even at +30% -- shorten it:\n  "${line.text}"`);
    clips.push(fitted);
    console.log(`  ${String(line.at).padStart(5)} s  ${fitted.len.toFixed(1)}/${slot.toFixed(1)} s${fitted.rate ? `  (+${fitted.rate}%)` : ""}  ${line.text}`);
  }

  // Delay each clip to its start time, sum them (they never overlap), and pad/trim to the video length.
  const inputs = clips.flatMap((c) => ["-i", c.file]);
  const delayed = clips.map((c, i) => `[${i + 1}:a]adelay=${Math.round(c.start * 1000)}:all=1[a${i}]`).join(";");
  const mix = `${clips.map((_, i) => `[a${i}]`).join("")}amix=inputs=${clips.length}:normalize=0:dropout_transition=0,apad,atrim=0:${videoLen.toFixed(3)}[out]`;
  const tmp = path.join(path.dirname(video), `.${path.basename(video)}.narrated.webm`);
  run(FFMPEG, [
    "-y", "-v", "error", "-i", video, ...inputs,
    "-filter_complex", `${delayed};${mix}`,
    "-map", "0:v:0", "-map", "[out]",
    "-c:v", "copy", "-c:a", "libopus", "-b:a", "64k", "-ac", "1",
    tmp,
  ]);
  renameSync(tmp, video);
  rmSync(work, { recursive: true, force: true });
}

const keys = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(NARRATION);
for (const key of keys) {
  if (!existsSync(path.join(VIDEOS, `${key}.webm`))) throw new Error(`Missing video: public/modules/${key}.webm`);
  console.log(`\n${key}`);
  await narrate(key);
}
console.log(`\nNarrated ${keys.length} video(s) with ${VOICE}.`);
