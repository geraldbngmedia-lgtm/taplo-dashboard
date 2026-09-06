# Floating companion visual prototype

A new standalone mock page showing the Taplo floating desktop companion over a blurred desktop backdrop, with a Warm/Dark theme toggle. Purely visual — nothing is wired to data or logic.

## Page

New route `/companion-mock` (does not touch the existing app shell, dashboard, or live panel). Full-viewport scene:

- Warm blurred backdrop: base color plus 3 large blurred color blobs.
- Companion floated centered with a soft drop shadow.
- Segmented "Warm / Dark" toggle pinned top-right; defaults to Warm and is the only interactive element (local `useState`).

## Companion

Two pieces docked edge to edge as one unit:

```text
+-----------------------------+------+
|  taplo         clock   x    | mark |
|  +-----------------------+  |      |
|  | • On this page        |  |  ⌕   |
|  | Sara Lindqvist     →  |  |      |
|  | Interviewed 12 Aug…   |  |  ⊕   |
|  | "Led the payments…"   |  |      |
|  | [ Add summary … ]     |  |  ⟳   |
|  +-----------------------+  |      |
|  Also worth a look          |      |
|  Johan Berg …               |      |
|  Amina Okafor … (faded)     |      |
|  [ Ask who you've… 🎤  ↑ ]  |      |
+-----------------------------+------+
   panel ~300px               rail ~46px
```

Panel: header (wordmark + clock/close icons), "On this page" frosted card with coral dot/label, name + arrow, muted meta, quoted evidence, solid ink primary button; "Also worth a look" label; two result rows (second faded); pinned frosted ask bar with placeholder, mic icon and solid square send button.

Rail: Taplo mark (rounded square, primary color) with coral notification dot top-right, then search / file-plus / history muted icons.

## Styling

- Both surfaces frosted glass: translucent fill + `backdrop-blur(22px)` + 1px light edge + soft shadow. Inner cards and ask bar are more opaque with `backdrop-blur(8px)` so text stays legible.
- Corners ~14px on the companion, ~11–12px inner.
- Coral appears only on the "On this page" dot/label and the rail notification dot. Primary buttons use the ink color.
- Plus Jakarta Sans 600 for the wordmark only; Inter elsewhere (both already loaded in the app head).

## Technical notes

- File: `src/routes/companion-mock.tsx`, plus a `src/components/companion/FloatingCompanion.tsx` component taking a `theme: "warm" | "dark"` prop.
- Theme tokens are defined as scoped CSS variables on the scene wrapper (two token sets, warm and dark) rather than global tokens, so the existing app theme is untouched. Values exactly as specified in the brief.
- Icons from `lucide-react` (already a dependency).
- Route gets its own `head()` with title/description/OG tags.
