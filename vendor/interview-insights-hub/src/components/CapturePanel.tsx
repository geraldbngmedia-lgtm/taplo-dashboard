import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Mic,
  Square,
  X,
  Loader2,
  RefreshCw,
  Check,
  ChevronDown,
  Languages,
  ShieldCheck,
} from "lucide-react";
import { captureStore, formatDuration, formatNow, type CapturedLine } from "@/lib/capture-store";
import { LiveQuestionPanel, type LiveQuestion } from "@/components/capture/LiveQuestionPanel";

import { PreviewToggle, type PreviewValue } from "@/components/capture/PreviewToggle";
import {
  FIXTURE_QUESTIONS,
  FIXTURE_ROLE,
  FIXTURE_STATES,
  FIXTURE_ELAPSED,
  type QState,
} from "@/lib/question-fixtures";
import type { InterviewQuestion } from "@/routes/api/questions";

function stamp(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

const LANGUAGES = ["English", "Svenska", "Norsk", "Dansk", "Deutsch", "Français", "Español"];

const DETECTED_TITLE = "Möte med Gerald Boakye | A Hub Group AB | Taplo";

type PanelMode = "meeting" | "interview";

export function CapturePanel() {
  const [open, setOpen] = useState(true);
  const setResponsiveDefault = useRef(false);
  const [mode, setMode] = useState<PanelMode>("interview");
  const [consented, setConsented] = useState(false);
  const [checkingConsent, setCheckingConsent] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jd, setJd] = useState("");
  const [jdOpen, setJdOpen] = useState(false);
  const [transcript, setTranscript] = useState<CapturedLine[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [level, setLevel] = useState(0);
  const [language, setLanguage] = useState<string>("");

  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [role, setRole] = useState("");
  const [states, setStates] = useState<Record<string, QState>>({});
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [statesLoading, setStatesLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewValue>("early");

  const navigate = useNavigate();

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptRef = useRef<CapturedLine[]>([]);
  const jdRef = useRef<string>("");
  const questionsRef = useRef<InterviewQuestion[]>([]);
  const statesRef = useRef<Record<string, QState>>({});
  const audioCtxRef = useRef<AudioContext | null>(null);
  const meterRafRef = useRef<number | null>(null);
  const flushingRef = useRef<boolean>(false);
  const flushResolveRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);
  useEffect(() => {
    jdRef.current = jd;
  }, [jd]);
  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);
  useEffect(() => {
    statesRef.current = states;
  }, [states]);

  useEffect(() => {
    if (setResponsiveDefault.current) return;
    setResponsiveDefault.current = true;
    if (window.matchMedia("(max-width: 1099px)").matches) setOpen(false);
  }, []);

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (meterRafRef.current) cancelAnimationFrame(meterRafRef.current);
      const r = recorderRef.current;
      if (r && r.state !== "inactive") r.stop();
      r?.stream.getTracks().forEach((t) => t.stop());
      if (audioCtxRef.current) void audioCtxRef.current.close();
    };
  }, []);

  useEffect(() => {
    // Questions are only created once consent is given and recording has started.
    if (!recording || !consented || !jd.trim()) return;
    if (questions.length > 0) return;
    const handle = setTimeout(async () => {
      setQuestionsLoading(true);
      try {
        const res = await fetch("/api/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jd }),
        });
        const data = (await res.json()) as {
          questions?: InterviewQuestion[];
          role?: string;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
        setQuestions(data.questions ?? []);
        setRole(data.role ?? "");
        setStates({});
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to generate questions");
      } finally {
        setQuestionsLoading(false);
      }
    }, 700);
    return () => clearTimeout(handle);
  }, [jd, recording, consented, questions.length]);

  async function sendChunk(blob: Blob, atSeconds: number): Promise<CapturedLine[]> {
    if (blob.size === 0) {
      setError("No audio captured — check the mic and try again.");
      return [];
    }
    setTranscribing(true);
    setError(null);
    try {
      const mime = (blob.type || "audio/webm").split(";")[0];
      const extMap: Record<string, string> = {
        "audio/webm": "webm",
        "audio/mp4": "mp4",
        "audio/mpeg": "mp3",
        "audio/ogg": "ogg",
        "audio/wav": "wav",
      };
      const ext = extMap[mime] ?? "webm";
      const form = new FormData();
      form.append("file", blob, `recording.${ext}`);
      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      const text = (data.text ?? "").trim();
      if (!text) return [];
      const newLines: CapturedLine[] = [{ t: stamp(atSeconds), who: "Candidate", line: text }];
      setTranscript((prev) => [...prev, ...newLines]);
      return newLines;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transcription failed");
      return [];
    } finally {
      setTranscribing(false);
    }
  }

  async function requestConsent() {
    setCheckingConsent(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setConsented(true);
    } catch (e: unknown) {
      const err = e as { name?: string; message?: string };
      if (err.name === "NotAllowedError")
        setError("Permission denied. Enable microphone access in browser settings.");
      else if (err.name === "NotFoundError") setError("No microphone found on this device.");
      else if (err.name === "NotReadableError") setError("Microphone is in use by another app.");
      else setError(err.message || "Could not access microphone.");
    } finally {
      setCheckingConsent(false);
    }
  }

  function attachMeter(stream: MediaStream) {
    try {
      const AC: typeof AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        setLevel(Math.min(1, rms * 3));
        meterRafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // best-effort
    }
  }

  function teardownMeter() {
    if (audioCtxRef.current) {
      void audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (meterRafRef.current) {
      cancelAnimationFrame(meterRafRef.current);
      meterRafRef.current = null;
    }
    setLevel(0);
  }

  async function startRecorder() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";
    const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    chunksRef.current = [];
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
      chunksRef.current = [];
      rec.stream.getTracks().forEach((t) => t.stop());

      if (flushingRef.current) {
        const sinceStart = Math.floor((Date.now() - startedAtRef.current) / 1000);
        await sendChunk(blob, sinceStart);
        teardownMeter();
        try {
          await startRecorder();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Could not resume recording");
          setRecording(false);
        }
        flushingRef.current = false;
        const r = flushResolveRef.current;
        flushResolveRef.current = null;
        r?.();
        return;
      }

      teardownMeter();
      const totalSec = Math.floor((Date.now() - startedAtRef.current) / 1000);
      const newLines = await sendChunk(blob, totalSec);
      const finalLines = [...transcriptRef.current, ...newLines];
      if (finalLines.length > 0) {
        const id = `cap-${Date.now()}`;
        captureStore.add({
          id,
          candidate: "Live capture",
          role: role || "Untitled role",
          date: formatNow(),
          duration: formatDuration(totalSec),
          jd: jdRef.current,
          transcript: finalLines,
          // Anything still open at the end is handed to the writeup as "not asked".
          notAsked: questionsRef.current
            .filter((q) => (statesRef.current[q.id] ?? "untouched") === "untouched")
            .map((q) => q.question),
        });
        void navigate({ to: "/analysis", search: { s: id } });
      }
    };
    recorderRef.current = rec;
    attachMeter(stream);
    rec.start();
    setRecording(true);
  }

  async function start() {
    setError(null);
    if (!consented) {
      setError("Confirm candidate consent first.");
      return;
    }
    if (!language) {
      setError("Pick the interview language first.");
      return;
    }
    try {
      startedAtRef.current = Date.now();
      setElapsed(0);
      setTranscript([]);
      setStates({});
      tickRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }, 500);
      await startRecorder();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Mic permission denied");
    }
  }

  function stop() {
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    setRecording(false);
  }

  function flush(): Promise<void> {
    const rec = recorderRef.current;
    if (!rec || rec.state === "inactive" || flushingRef.current) return Promise.resolve();
    return new Promise((resolve) => {
      flushingRef.current = true;
      flushResolveRef.current = resolve;
      rec.stop();
    });
  }

  async function updateStates() {
    setError(null);
    if (questions.length === 0) {
      setError("Add a JD to generate questions first.");
      return;
    }
    setStatesLoading(true);
    try {
      if (recording) await flush();
      const liveTranscript = transcriptRef.current.map((l) => l.line).join(" ");
      if (!liveTranscript.trim()) {
        setError("Nothing captured yet — record something first.");
        return;
      }
      const res = await fetch("/api/question-states", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: questions.map((q) => ({
            id: q.id,
            question: q.question,
            requirement: q.requirement,
          })),
          transcript: liveTranscript,
        }),
      });
      const data = (await res.json()) as { states?: Record<string, QState>; error?: string };
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setStates(data.states ?? {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setStatesLoading(false);
    }
  }

  const useLive = recording || Object.keys(states).length > 0 || questions.length > 0;
  const listQuestions = useLive ? questions : FIXTURE_QUESTIONS;
  const listStates: Record<string, QState> = useLive ? states : FIXTURE_STATES[preview];
  const listRole = useLive ? role : FIXTURE_ROLE;
  const listElapsed = useLive ? elapsed : FIXTURE_ELAPSED[preview];

  const canStart = consented && !!language;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-11 items-center gap-2 rounded-[10px] border border-[var(--hairline)] bg-[var(--surface)] px-4 text-[13px] text-[var(--ink)] shadow-[var(--shadow-overlay)] hover:bg-[var(--bg)]"
        aria-label="Open capture panel"
      >
        <Mic className="h-4 w-4" />
        Capture
      </button>
    );
  }

  // Once consent is given and recording starts, the panel becomes a questions panel.
  if (recording) {
    return (
      <div
        className="fixed bottom-6 right-6 z-40 flex max-h-[calc(100vh-3rem)] w-[380px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-[16px] text-[var(--ink)]"
        style={{
          background: "rgba(255,253,249,0.68)",
          backdropFilter: "blur(22px)",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "0 22px 54px rgba(42,33,27,0.20)",
        }}
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-1">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--state-stop)]">
            <span className="h-[7px] w-[7px] rounded-full bg-[var(--state-stop)]" />
            Recording · <span className="tabular-nums">{stamp(elapsed)}</span>
          </span>
          <button
            onClick={stop}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--state-stop)] px-4 py-2 text-[13px] font-semibold text-white shadow-sm hover:opacity-90"
          >
            <Square className="h-3.5 w-3.5" />
            Stop
          </button>
        </div>

        <h3
          className="px-5 pb-3 pt-2 text-[19px] font-bold leading-tight text-[var(--ink)]"
          style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
        >
          Untitled session
        </h3>

        <div className="scroll-quiet flex-1 overflow-y-auto px-4 pb-4">
          {questionsLoading ? (
            <p className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--ink-faint)]">
              <Loader2 className="h-3 w-3 animate-spin" />
              Preparing questions…
            </p>
          ) : questions.length === 0 ? (
            <p className="text-[12.5px] text-[var(--ink-faint)]">
              Add a job description to generate questions.
            </p>
          ) : (
            <LiveQuestionPanel variant="cards" questions={toLiveQuestions(questions, states)} />
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-[var(--hairline)] px-5 py-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--state-covered)]" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
            Live capture active
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[380px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-[14px] border border-[var(--hairline)] bg-[var(--surface-page)] text-[var(--ink)]">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <ModeToggle value={mode} onChange={setMode} />
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.08em] tnum"
              style={{ color: "var(--accent)" }}
            >
              {recording
                ? `Recording · ${stamp(elapsed)}`
                : mode === "interview"
                  ? "Interview ready"
                  : "Meeting ready"}
            </div>
          </div>
          <h3
            className="mt-1.5 truncate text-[15.5px] font-semibold leading-[1.35] text-[var(--ink)]"
            style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
            title={DETECTED_TITLE}
          >
            {DETECTED_TITLE}
          </h3>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--hairline)] bg-[var(--surface)] text-[var(--ink-muted)] transition-colors duration-150 hover:text-[var(--ink)]"
          aria-label="Close panel"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-3 p-5 pt-4">
        {/* JD row */}
        <div className="rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)]">
          <button
            onClick={() => setJdOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          >
            <span className="min-w-0 flex-1">
              <span className="text-[13.5px] font-semibold text-[var(--ink)]">Job description</span>
              <span className="ml-2 text-[12.5px] text-[var(--ink-faint)]">Improves analysis</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--hairline)] bg-[var(--bg)] px-3 py-1.5 text-[12px] font-semibold text-[var(--ink-muted)]">
              {jd.trim() ? (
                <>
                  <Check className="h-3 w-3" /> Added
                </>
              ) : (
                <>{jdOpen ? "Close" : "Add"}</>
              )}
            </span>
          </button>
          {jdOpen && (
            <div className="border-t border-[var(--hairline)] px-4 py-3">
              <textarea
                rows={4}
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the JD — questions generate automatically…"
                className="w-full resize-none rounded-[10px] border border-[var(--hairline)] bg-[var(--bg)] px-3 py-2 text-[13px] leading-relaxed text-[var(--ink)] placeholder:text-[var(--ink-faint)] outline-none focus:border-[var(--accent)]"
              />
              {questionsLoading && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] text-[var(--ink-faint)]">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Generating questions…
                </p>
              )}
            </div>
          )}
        </div>

        {/* RECORDING section */}
        <Card
          label={
            recording
              ? "Recording · Live"
              : transcribing
                ? "Recording · Processing"
                : "Recording · Ready"
          }
        >
          {/* Language selector */}
          <div className="flex items-stretch gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--hairline)] bg-[var(--bg)] px-3 text-[13px] font-medium text-[var(--ink)]">
              <Languages className="h-3.5 w-3.5 text-[var(--ink-muted)]" />
              Language
            </div>
            <div className="relative flex-1">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={recording}
                className="w-full appearance-none rounded-[10px] border border-[var(--hairline)] bg-[var(--bg)] px-3 py-2.5 pr-9 text-[13.5px] text-[var(--ink)] outline-none transition-colors duration-150 focus:border-[var(--accent)] disabled:opacity-60"
              >
                <option value="">Select…</option>
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]" />
            </div>
          </div>

          {!language && (
            <p className="mt-2.5 text-[12px] text-[var(--ink-faint)]">
              Pick the interview language to enable Start.
            </p>
          )}

          {/* Consent */}
          <label className="mt-3 flex cursor-pointer items-center gap-2.5 rounded-[10px] border border-[var(--hairline)] bg-[var(--bg)] px-3 py-2.5">
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors duration-150 ${
                consented
                  ? "border-[var(--accent)] bg-[var(--accent)]"
                  : "border-[var(--ink-faint)] bg-[var(--surface)]"
              }`}
            >
              {consented && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
            </span>
            <input
              type="checkbox"
              checked={consented}
              onChange={(e) => {
                if (e.target.checked) void requestConsent();
                else setConsented(false);
              }}
              className="sr-only"
            />
            <ShieldCheck className="h-4 w-4 text-[var(--ink-muted)]" />
            <span className="text-[13px] font-medium text-[var(--ink)]">
              I have candidate consent
            </span>
            {checkingConsent && (
              <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-[var(--ink-muted)]" />
            )}
          </label>

          {/* Start / Stop */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={recording ? stop : () => void start()}
              disabled={!recording && !canStart}
              className={`flex-1 rounded-[12px] px-4 py-3 text-[14px] font-semibold transition-all duration-150 ${
                recording
                  ? "bg-[var(--ink)] text-white hover:opacity-90"
                  : canStart
                    ? "bg-[var(--accent)] text-white shadow-[0_4px_14px_rgba(245,118,95,0.35)] hover:opacity-90"
                    : "cursor-not-allowed bg-[color:color-mix(in_oklab,var(--ink)_18%,transparent)] text-white/85"
              }`}
            >
              <span className="inline-flex items-center justify-center gap-2">
                {recording ? (
                  <>
                    <Square className="h-3.5 w-3.5" fill="currentColor" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Start
                  </>
                )}
              </span>
            </button>
          </div>

          {recording && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[11.5px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                Input
              </span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--hairline)]">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-75"
                  style={{ width: `${Math.round(level * 100)}%` }}
                />
              </div>
              {transcribing && <Loader2 className="h-3 w-3 animate-spin text-[var(--ink-muted)]" />}
            </div>
          )}
        </Card>

        {error && <p className="text-[12.5px] text-[var(--accent)]">{error}</p>}

        {/* Questions — only when a JD-driven session is active */}
        {(recording || useLive) && (
          <Card label="Interview questions">
            <div className="mb-2 flex justify-end">
              <button
                onClick={() => void updateStates()}
                disabled={statesLoading || transcribing || questions.length === 0}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--hairline)] bg-[var(--bg)] px-2.5 py-1 text-[11.5px] font-medium text-[var(--ink-muted)] hover:text-[var(--ink)] disabled:opacity-50"
              >
                {statesLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Update
              </button>
            </div>
            {questionsLoading ? (
              <p className="text-[12.5px] text-[var(--ink-faint)]">Preparing questions…</p>
            ) : listQuestions.length === 0 ? (
              <p className="text-[12.5px] text-[var(--ink-faint)]">
                Paste a JD above to generate questions.
              </p>
            ) : (
              <LiveQuestionPanel embedded questions={toLiveQuestions(listQuestions, listStates)} />
            )}

            {!recording && !useLive && <PreviewToggle value={preview} onChange={setPreview} />}
          </Card>
        )}
      </div>
    </div>
  );
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] p-4">
      <div
        className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-faint)]"
        style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function RowCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] px-4 py-3">
      {children}
    </div>
  );
}

function ModeToggle({ value, onChange }: { value: PanelMode; onChange: (v: PanelMode) => void }) {
  const options: { key: PanelMode; label: string }[] = [
    { key: "meeting", label: "Meeting" },
    { key: "interview", label: "Interview" },
  ];
  return (
    <div
      role="tablist"
      aria-label="Panel mode"
      className="inline-flex rounded-full bg-[var(--surface-sunken)] p-0.5"
    >
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <button
            key={opt.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.key)}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
              active
                ? "bg-[var(--surface-card)] text-[var(--ink)] shadow-[0_1px_2px_rgba(42,33,27,0.08)]"
                : "text-[var(--ink-secondary)] hover:text-[var(--ink)]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function toLiveQuestions(
  questions: InterviewQuestion[],
  states: Record<string, QState>,
): LiveQuestion[] {
  const labels: Record<string, string> = {
    background: "Background",
    qualifications: "Qualifications",
    working_style: "Working style",
    practical: "Practical",
  };

  return questions.map((q) => {
    const s = states[q.id] ?? "untouched";
    // Soft mapping: anything not clearly covered or clearly weak stays open.
    const state = s === "covered" ? "confirmed" : s === "weak" ? "thin" : "open";
    return {
      id: q.id,
      text: q.question,
      state,
      label: labels[q.category ?? "qualifications"],
      // Follow-up is only offered while the answer reads thin.
      cue: state === "thin" ? q.probe || q.requirement : undefined,
    } satisfies LiveQuestion;
  });
}
