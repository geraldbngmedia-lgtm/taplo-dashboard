import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { TaploLogo } from "@/components/ui-taplo/TaploLogo";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome to Taplo" },
      {
        name: "description",
        content: "Record, transcribe, and analyze interviews with AI — built for recruiters.",
      },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      {/* Brand */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[oklch(0.97_0.018_75)] via-background to-[oklch(0.92_0.04_40)] p-10 lg:p-14">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[oklch(0.78_0.14_75)]/20 blur-3xl" />

        <div className="relative flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <TaploLogo variant="wordmark" className="h-8 max-w-[180px]" />
          </Link>
        </div>

        <div className="relative max-w-lg">
          <div className="text-xs uppercase tracking-[0.22em] text-primary">
            For recruiters
          </div>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] tracking-tight lg:text-6xl">
            Hear every signal. <em className="font-serif italic text-primary">Miss nothing.</em>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            Taplo records your interviews, transcribes them, and delivers a structured candidate
            dossier — submission draft, follow-up email, and gaps to revisit — minutes after you
            hang up.
          </p>

          <div className="mt-10 grid gap-3 text-sm">
            {[
              "Live coverage tracking against the JD",
              "Whisper + GPT-4.1-mini, your own key",
              "Everything stays on your machine",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                  ✓
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-muted-foreground">
          Trusted by independent recruiters and boutique search firms.
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/dashboard" });
            }}
            className="w-full rounded-3xl border border-border bg-card p-8 shadow-soft"
          >
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Set up your workspace
            </div>
            <h2 className="mt-1 font-serif text-3xl">Let's get you started</h2>
            <p className="mt-1 text-sm text-muted-foreground">Takes about 30 seconds.</p>

            <div className="mt-7 space-y-4">
              <Field label="Your name" placeholder="Elena Marsh" defaultValue="Elena Marsh" />
              <Field
                label="Email"
                type="email"
                placeholder="elena@hollowaytalent.com"
                defaultValue="elena@hollowaytalent.com"
              />
              <Field
                label="Company"
                placeholder="Holloway Talent"
                defaultValue="Holloway Talent"
              />

              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  OpenAI API key
                </label>
                <div className="relative mt-1.5">
                  <input
                    type={showKey ? "text" : "password"}
                    defaultValue="sk-proj-•••••••••••••••••••••••••••"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 pr-10 text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-3 w-3 text-success" />
                  Stored locally on this device. Never sent to Taplo servers.
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="mt-7 w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Continue to workspace
            </button>

            <Link
              to="/dashboard"
              className="mt-3 block text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Skip and explore the demo →
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        {...props}
        className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}
