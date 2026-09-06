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
  ExternalLink,
  Plus,
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
import { useIsDemo } from "@/components/demo/DemoHost";
import { demoSearchFromWindow } from "@/lib/demo/demo-mode";
import {
  DEMO_CANDIDATE,
  DEMO_CAPTURED_SESSION,
  DEMO_QUESTIONS,
  DEMO_ROLE,
  DEMO_SESSION_ID,
  RAVI_JD,
  coverageForDemoElapsed,
} from "@/lib/demo/fixtures";

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

type CapturePanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const panelShell =
  "fixed z-40 overflow-hidden text-[var(--ink)] inset-x-3 bottom-3 w-auto max-h-[min(85dvh,640px)] xl:inset-x-auto xl:left-auto xl:bottom-6 xl:right-6 xl:w-[380px] xl:max-w-[calc(100vw-1.5rem)] xl:max-h-[calc(100dvh-3rem)]";

export function CapturePanel({ open, onOpenChange }: CapturePanelProps) {
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
  const [demoPlayback, setDemoPlayback] = useState(false);
  const [detected, setDetected] = useState<"pending" | "confirmed" | "dismissed">("dismissed");

  const demo = useIsDemo();
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
    if (demo.demo) setDetected("pending");
  }, [demo.demo]);

  useEffect(() => {
    if (!demoPlayback || !recording) return;
    setStates(coverageForDemoElapsed(elapsed));
  }, [demoPlayback, recording, elapsed]);

  useEffect(() => {
    // Questions are only created once consent is given and recording has started.
    if (demoPlayback) return;
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
  }, [jd, recording, consented, questions.length, demoPlayback]);

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
    if (demo.demo) {
      setConsented(true);
      return;
    }
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
        void navigate({
          to: "/analysis",
          search: { s: id, ...demoSearchFromWindow() } as never,
        });
      }
    };
    recorderRef.current = rec;
    attachMeter(stream);
    rec.start();
    setRecording(true);
  }

  function startDemoPlayback() {
    setError(null);
    setConsented(true);
    setLanguage((current) => current || "English");
    setJd((current) => current.trim() || RAVI_JD);
    setJdOpen(false);
    setQuestions(DEMO_QUESTIONS);
    setRole(DEMO_ROLE);
    setStates(coverageForDemoElapsed(0));
    setTranscript(DEMO_CAPTURED_SESSION.transcript);
    setDemoPlayback(true);
    setDetected("confirmed");
    startedAtRef.current = Date.now();
    setElapsed(0);
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 500);
    setRecording(true);
  }

  async function start() {
    setError(null);
    if (demo.demo) {
      startDemoPlayback();
      return;
    }
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
    if (demoPlayback) {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      setRecording(false);
      setDemoPlayback(false);
      captureStore.ensure(DEMO_CAPTURED_SESSION);
      void navigate({
        to: "/analysis",
        search: { s: DEMO_SESSION_ID, ...demoSearchFromWindow() } as never,
      });
      return;
    }
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

  const canStart = demo.demo ? detected !== "pending" : consented && !!language;

  if (!open) {
    return (
      <button
        onClick={() => onOpenChange(true)}
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex h-11 items-center gap-2 rounded-[10px] border border-[var(--hairline)] bg-[var(--surface)] px-4 text-[13px] text-[var(--ink)] shadow-[var(--shadow-overlay)] hover:bg-[var(--bg)] xl:bottom-6 xl:right-6"
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
        className={`${panelShell} flex flex-col rounded-[16px]`}
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
          {demo.demo ? `${DEMO_CANDIDATE} · ${DEMO_ROLE}` : "Untitled session"}
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
    <div className={`${panelShell} overflow-y-auto rounded-[14px] border border-[var(--hairline)] bg-[var(--surface-page)]`}>
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
            title={demo.demo ? `${DEMO_CANDIDATE} · ${DEMO_ROLE}` : DETECTED_TITLE}
          >
            {demo.demo
              ? `Interview starting — ${DEMO_CANDIDATE} · ${DEMO_ROLE}`
              : DETECTED_TITLE}
          </h3>
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--hairline)] bg-[var(--surface)] text-[var(--ink-muted)] transition-colors duration-150 hover:text-[var(--ink)]"
          aria-label="Close panel"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-3 p-5 pt-4">
        {demo.demo && detected === "pending" ? (
          <div className="rounded-[12px] border border-[color:color-mix(in_oklab,var(--accent)_35%,var(--hairline))] bg-[color:color-mix(in_oklab,var(--accent)_8%,var(--surface))] px-4 py-3">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]"
              style={{ fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui' }}
            >
              Meeting detected
            </p>
            <p className="mt-1 text-[13px] font-semibold text-[var(--ink)]">
              Taplo noticed this interview
            </p>
            <p className="mt-0.5 text-[12px] text-[var(--ink-muted)]">
              {DEMO_CANDIDATE} · {DEMO_ROLE}. Confirm to track coverage on what they say.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => startDemoPlayback()}
                className="rounded-[10px] bg-[var(--accent)] px-3.5 py-2 text-[13px] font-semibold text-white hover:opacity-90"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setDetected("dismissed")}
                className="rounded-[10px] border border-[var(--hairline)] bg-[var(--surface)] px-3.5 py-2 text-[13px] font-semibold text-[var(--ink-muted)] hover:text-[var(--ink)]"
              >
                Not now
              </button>
            </div>
          </div>
        ) : null}

        {demo.demo ? (
          <div className="flex items-center justify-between gap-3 rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)] px-4 py-3">
            <span className="text-[13.5px] font-semibold text-[var(--ink)]">Join meeting</span>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3 py-1.5 text-[12px] font-semibold text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </button>
          </div>
        ) : null}
        {/* JD row */}
        <div className="rounded-[12px] border border-[var(--hairline)] bg-[var(--surface)]">
          <button
            onClick={() => {
              if (demo.demo && !jd.trim()) {
                setJd(RAVI_JD);
                setJdOpen(true);
                return;
              }
              setJdOpen((v) => !v);
            }}
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
                <>
                  <Plus className="h-3 w-3" />
                  {jdOpen ? "Close" : "Add"}
                </>
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

            {!recording && !useLive && !demo.demo && (
              <PreviewToggle value={preview} onChange={setPreview} />
            )}
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
