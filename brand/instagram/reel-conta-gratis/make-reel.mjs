import { chromium } from "playwright";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const shots = path.join(dir, "shots");
const out = path.join(dir, "PerfilPro-conta-gratis-reel.mp4");
const ffmpeg =
  process.env.FFMPEG_PATH ||
  path.join(
    process.env.TEMP || "/tmp",
    "pp-ffmpeg/node_modules/ffmpeg-static/ffmpeg.exe",
  );
const root = path.resolve(dir, "../../..");

mkdirSync(shots, { recursive: true });
const publicShots = path.join(root, "public/__reel-shots");
mkdirSync(publicShots, { recursive: true });
copyFileSync(
  path.join(dir, "storyboard.html"),
  path.join(root, "public/__reel.html"),
);

const browser = await chromium.launch();
const phone = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});

await phone.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
await phone.waitForTimeout(900);
await phone.screenshot({ path: path.join(shots, "home.png") });

await phone.goto("http://localhost:3000/cadastro", {
  waitUntil: "domcontentloaded",
});
await phone.waitForTimeout(900);
await phone.screenshot({ path: path.join(shots, "cadastro.png") });
copyFileSync(path.join(shots, "home.png"), path.join(publicShots, "home.png"));
copyFileSync(
  path.join(shots, "cadastro.png"),
  path.join(publicShots, "cadastro.png"),
);

const reel = await browser.newPage({
  viewport: { width: 1080, height: 1920 },
  deviceScaleFactor: 1,
});

for (let i = 1; i <= 7; i += 1) {
  await reel.goto(`http://localhost:3000/__reel.html?s=${i}`, {
    waitUntil: "networkidle",
    timeout: 30_000,
  });
  await reel.waitForTimeout(350);
  await reel.screenshot({
    path: path.join(shots, `scene-${String(i).padStart(2, "0")}.png`),
  });
}

await browser.close();

const durations = [2.4, 2.8, 2.8, 3.2, 2.8, 2.8, 3.6];
const clips = [];
for (let i = 0; i < durations.length; i += 1) {
  const frames = Math.round(durations[i] * 30);
  const clip = path.join(shots, `clip-${String(i + 1).padStart(2, "0")}.mp4`);
  const img = path.join(shots, `scene-${String(i + 1).padStart(2, "0")}.png`);
  const vf = `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(1.06,1+0.0007*on)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1080x1920:fps=30,format=yuv420p`;
  const r = spawnSync(
    ffmpeg,
    [
      "-y",
      "-loop",
      "1",
      "-i",
      img,
      "-vf",
      vf,
      "-t",
      String(durations[i]),
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-crf",
      "17",
      "-preset",
      "medium",
      clip,
    ],
    { stdio: "inherit" },
  );
  if (r.status !== 0) throw new Error(`clip ${i + 1} failed`);
  clips.push(clip);
}

const fade = 0.35;
let filter = "";
let last = "[0:v]";
let offset = durations[0] - fade;
for (let i = 1; i < clips.length; i += 1) {
  const next = i === clips.length - 1 ? "[v]" : `[v${i}]`;
  filter += `${last}[${i}:v]xfade=transition=fade:duration=${fade}:offset=${offset.toFixed(2)}${next};`;
  last = next;
  offset += durations[i] - fade;
}

const args = ["-y"];
for (const clip of clips) args.push("-i", clip);
args.push(
  "-filter_complex",
  filter.slice(0, -1),
  "-map",
  "[v]",
  "-c:v",
  "libx264",
  "-pix_fmt",
  "yuv420p",
  "-crf",
  "17",
  "-preset",
  "medium",
  "-movflags",
  "+faststart",
  "-an",
  out,
);
const encoded = spawnSync(ffmpeg, args, { stdio: "inherit" });
if (encoded.status !== 0) throw new Error("encode failed");
rmSync(path.join(root, "public/__reel.html"), { force: true });
rmSync(publicShots, { recursive: true, force: true });
console.log(out);
