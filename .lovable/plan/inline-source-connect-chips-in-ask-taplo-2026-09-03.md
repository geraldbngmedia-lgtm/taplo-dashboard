# Inline source connect chips in Ask Taplo

Make the assistant aware that its answers are grounded in the recruiter's ATS and LinkedIn, and surface a small inline "Connect" chip whenever a reply mentions a source that isn't connected yet. Connected sources render as a quiet "Connected" badge instead.

## Behaviour

- Detected sources: LinkedIn, Teamtailor, Greenhouse, Lever, Workable, Ashby, SmartRecruiters.
- When an assistant message mentions one of these by name, a chip row appears directly under that message: source icon/name + "Connect".
- Clicking Connect opens a small confirmation dialog (mock: "Connect LinkedIn to Taplo" with what would be pulled), and confirming marks it connected.
- Connection state persists in the browser (localStorage), same pattern as the existing capture/chat stores. Already-connected sources show a muted "Connected" pill, no button.
- Each source appears at most once per message; chips only render on assistant messages, never on user messages.
- Suggestion cards and empty state are untouched.

## Where it shows

- Dashboard assistant (primary chat surface).
- Same chip component reused in the standalone chat thread view so behaviour matches.
- Settings gets a small "Connected sources" list showing the same state with connect/disconnect, so the mock is reversible.

## System prompt

The chat API system prompt gains one line stating the assistant is grounded in the recruiter's interviews plus their connected ATS and LinkedIn data, and should name the source it would draw from when relevant. No change to streaming or model.

## Technical notes

- New `src/lib/integrations-store.ts`: `useSyncExternalStore` store with `{ id, name, connected }` records, localStorage key `taplo.integrations.v1`, SSR-safe hydration like `chat-store.ts`.
- New `src/components/dashboard/SourceConnectChips.tsx`: takes message text, runs a case-insensitive word-boundary match against the source registry, dedupes, renders chips using existing glass tokens (`--dashboard-glass-soft`, `--glass-border`, `--accent`).
- `DashboardAssistant.tsx`: render `<SourceConnectChips text={message.content} />` under assistant `MessageContent` when the message is complete (not mid-stream) — keeps streaming output from flickering chips.
- Connect dialog uses the existing shadcn `dialog`/`alert-dialog` primitive; no new dependencies.
- No backend, no schema, no real OAuth.
