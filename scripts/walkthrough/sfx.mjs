import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../sfx");

function wavFromPcm(pcm, sampleRate = 44100) {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

function tone({ freq, ms, volume, sampleRate = 44100, noise = 0 }) {
  const n = Math.floor((sampleRate * ms) / 1000);
  const pcm = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) {
    const env = Math.exp(-i / (n * 0.22));
    const sine = Math.sin((2 * Math.PI * freq * i) / sampleRate);
    const nse = (Math.random() * 2 - 1) * noise;
    const sample = (sine * (1 - noise) + nse) * volume * env;
    pcm.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(sample * 32767))), i * 2);
  }
  return pcm;
}

export function ensureSfx() {
  mkdirSync(root, { recursive: true });
  const click = wavFromPcm(tone({ freq: 920, ms: 45, volume: 0.38, noise: 0.35 }));
  const key = wavFromPcm(tone({ freq: 1480, ms: 22, volume: 0.16, noise: 0.12 }));
  writeFileSync(path.join(root, "click.wav"), click);
  writeFileSync(path.join(root, "key.wav"), key);
  return {
    clickPath: path.join(root, "click.wav"),
    keyPath: path.join(root, "key.wav"),
    clickPcm: click.subarray(44),
    keyPcm: key.subarray(44),
  };
}

export function mixEvents(events, durationMs, sfx) {
  const sampleRate = 44100;
  const total = Math.max(1, Math.ceil((durationMs / 1000) * sampleRate));
  const mix = new Float32Array(total);
  const stamps = { click: sfx.clickPcm, key: sfx.keyPcm };

  for (const event of events) {
    const pcm = stamps[event.kind];
    if (!pcm) continue;
    const start = Math.floor((event.t / 1000) * sampleRate);
    const samples = pcm.length / 2;
    const gain = event.kind === "key" ? 0.7 : 1;
    for (let i = 0; i < samples; i++) {
      const idx = start + i;
      if (idx >= total) break;
      mix[idx] += (pcm.readInt16LE(i * 2) / 32768) * gain;
    }
  }

  const out = Buffer.alloc(total * 2);
  for (let i = 0; i < total; i++) {
    out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(mix[i] * 32767))), i * 2);
  }
  return wavFromPcm(out, sampleRate);
}
