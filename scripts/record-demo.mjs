import { mkdir, copyFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { chromium } from "playwright";
import { ensureSfx, mixEvents } from "./walkthrough/sfx.mjs";
import {
  ensureCursor,
  moveClick,
  moveTo,
  sleep,
  typeSlow,
  zoomOn,
} from "./walkthrough/actions.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "demo-output");
const publicDir = path.join(root, "public");
const hub = process.env.HUB_URL ?? "http://127.0.0.1:8081";
const widget = process.env.WIDGET_URL ?? "http://localhost:3000";

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit" });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
    child.on("error", reject);
  });
}

function ffmpegBin() {
  return (
    process.env.FFMPEG_PATH ??
    "C:\\Users\\GeraldBoakye\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-full_build\\bin\\ffmpeg.exe"
  );
}

async function connectSource(page, name, events, startedAt) {
  const row = page.locator("li").filter({ hasText: name }).first();
  const button = row.getByRole("button", { name: /Connect|Disconnect/ });
  await button.waitFor({ state: "visible" });
  const label = ((await button.textContent()) ?? "").trim();
  if (label.includes("Disconnect")) return;
  await zoomOn(page, button);
  await moveClick(page, button, events, startedAt);
}

async function walk(page, events, startedAt) {
  await page.goto(`${hub}/dashboard`, { waitUntil: "load", timeout: 60_000 });
  await ensureCursor(page);
  await sleep(700);

  const closePanel = page.getByRole("button", { name: "Close panel" });
  await closePanel.waitFor({ state: "visible", timeout: 8_000 }).catch(() => {});
  if (await closePanel.isVisible().catch(() => false)) {
    await moveClick(page, closePanel, events, startedAt);
    await closePanel.waitFor({ state: "hidden", timeout: 5_000 }).catch(() => {});
  }

  const composer = page.getByPlaceholder("Ask Taplo anything…");
  await zoomOn(page, composer);
  await typeSlow(page, composer, "@Teamtailor strongest platform hire", events, startedAt);
  await sleep(200);
  events.push({ t: Date.now() - startedAt, kind: "key" });
  await page.keyboard.press("Enter");
  await page.getByText("Teamtailor").first().waitFor({ timeout: 20_000 }).catch(() => {});
  await sleep(4200);

  await page.goto(`${hub}/settings`, { waitUntil: "load", timeout: 60_000 });
  await ensureCursor(page);
  await sleep(500);
  await connectSource(page, "LinkedIn", events, startedAt);
  await sleep(400);
  await connectSource(page, "Teamtailor", events, startedAt);
  await sleep(900);

  await page.goto(widget, { waitUntil: "load", timeout: 60_000 });
  await ensureCursor(page);
  await sleep(800);
  const addJd = page.getByRole("button", { name: "Add" });
  await moveClick(page, addJd, events, startedAt);
  await sleep(300);
  await page.locator("#language").waitFor({ state: "visible" });
  await moveTo(page, page.locator("#language"));
  events.push({ t: Date.now() - startedAt, kind: "click" });
  await page.locator("#language").selectOption("en");
  await sleep(250);
  await moveClick(page, page.locator("label.consent-row"), events, startedAt);
  await sleep(300);
  const start = page.locator("button.start-button");
  await start.waitFor({ state: "visible" });
  await page.waitForFunction(() => {
    const btn = document.querySelector("button.start-button");
    return btn instanceof HTMLButtonElement && !btn.disabled;
  });
  await zoomOn(page, start);
  await moveClick(page, start, events, startedAt);
  const question = page.locator(".question").first();
  await question.waitFor({ state: "visible", timeout: 10_000 });
  await zoomOn(page, question);
  await moveClick(page, question, events, startedAt);
  await question.dblclick();
  events.push({ t: Date.now() - startedAt, kind: "click" });
  await sleep(2600);

  await page.goto(`${hub}/analysis`, { waitUntil: "load", timeout: 60_000 });
  await ensureCursor(page);
  await sleep(600);
  const sessionPicker = page.locator("select").first();
  if (await sessionPicker.isVisible().catch(() => false)) {
    await moveTo(page, sessionPicker);
    events.push({ t: Date.now() - startedAt, kind: "click" });
    const optionCount = await sessionPicker.locator("option").count();
    await sessionPicker.selectOption({ index: optionCount > 1 ? 1 : 0 });
    await page.waitForLoadState("load");
    await ensureCursor(page);
    await sleep(500);
  }
  const analysisCard = page.getByRole("heading", { name: "Analysis" }).first();
  await zoomOn(page, analysisCard);
  await page.getByText("Transcript").scrollIntoViewIfNeeded();
  await sleep(2400);

  await page.goto(`${hub}/dashboard`, { waitUntil: "load", timeout: 60_000 });
  await ensureCursor(page);
  const closeAgain = page.getByRole("button", { name: "Close panel" });
  if (await closeAgain.isVisible().catch(() => false)) {
    await moveClick(page, closeAgain, events, startedAt);
  }
  const newer = page.getByRole("button", { name: "New conversation" });
  if (await newer.isVisible().catch(() => false)) {
    await moveClick(page, newer, events, startedAt);
    await sleep(400);
  }
  const composer2 = page.getByPlaceholder("Ask Taplo anything…");
  await typeSlow(page, composer2, "Bring back the write-up from yesterday’s platform interview", events, startedAt);
  events.push({ t: Date.now() - startedAt, kind: "key" });
  await page.keyboard.press("Enter");
  await page.getByText("interview record").first().waitFor({ timeout: 20_000 }).catch(() => {});
  await sleep(5200);
}

async function main() {
  await mkdir(outDir, { recursive: true });
  await mkdir(publicDir, { recursive: true });
  const sfx = ensureSfx();
  const events = [];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    recordVideo: { dir: outDir, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  const startedAt = Date.now();
  console.log(`Hub ${hub}  Widget ${widget}`);
  await walk(page, events, startedAt);
  const elapsed = Date.now() - startedAt;
  const video = page.video();
  await context.close();
  await browser.close();

  const webm = video ? await video.path() : undefined;
  if (!webm) throw new Error("Playwright did not write a video file.");

  const mix = mixEvents(events, elapsed + 400, sfx);
  const mixPath = path.join(outDir, "sfx.wav");
  await writeFile(mixPath, mix);

  const publicWebm = path.join(publicDir, "taplo-product-demo.webm");
  await copyFile(webm, publicWebm);

  const mp4 = path.join(outDir, "taplo-product-demo.mp4");
  const publicMp4 = path.join(publicDir, "taplo-product-demo.mp4");
  await run(ffmpegBin(), [
    "-y",
    "-i",
    webm,
    "-i",
    mixPath,
    "-c:v",
    "libx264",
    "-crf",
    "18",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-shortest",
    "-movflags",
    "+faststart",
    mp4,
  ]);
  await copyFile(mp4, publicMp4);
  console.log(`Wrote ${publicMp4} (${events.length} sfx events, ${Math.round(elapsed / 1000)}s)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
