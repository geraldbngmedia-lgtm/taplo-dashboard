# Dashboard glass, responsive spacing, and composer refinement

## Goal
Bring the dashboard closer to the selected warm glass reference, prevent the chat workspace from competing with the floating capture panel, and make composing feel smoother without changing chat, recording, thread, or API behavior.

## Changes
1. **Refine the warm glass system**
   - Tune semantic glass tokens in the global design system for translucent surfaces, light edge highlights, layered shadows, and focused elevation.
   - Apply the shared treatment consistently to the dashboard composer, suggestion actions, toolbar controls, history popover, and message surfaces.
   - Preserve the Taplo Warm palette and Plus Jakarta Sans typography, with reduced-motion support.

2. **Make dashboard geometry panel-aware**
   - Replace the current fixed horizontal translations with explicit responsive content gutters and width constraints based on the sidebar and the capture panel’s 380px footprint.
   - Keep the reading column and both composer positions centered in the genuinely available canvas area on wide screens.
   - At narrow desktop/tablet widths, reclaim the full chat canvas and tighten spacing without clipping controls or messages.
   - On phone widths, default the capture panel to the compact **Capture** tab selected by the user; opening it remains available as an intentional overlay while the resting chat layout stays unobstructed.

3. **Polish composer interaction**
   - Keep the existing IME-safe Enter-to-send and Shift+Enter-for-new-line behavior already provided by the prompt input primitive.
   - Refine controlled auto-resize so the textarea grows smoothly up to a capped height, resets after sending or switching threads, and scrolls internally only after reaching the cap.
   - Add clearer idle, hover, focus-within, disabled, submitted, and streaming visual states without changing submit/stop logic.
   - Smooth the transition from the centered empty-state composer to the active bottom dock and keep message padding synchronized with its changing height.

## Technical details
- Limit functional edits to dashboard presentation, the shared prompt textarea behavior needed for reliable resizing, and responsive capture-panel presentation.
- Continue using existing `PromptInput`, `Conversation`, `Message`, shadcn controls, chat store, and capture store.
- Express new visual values as semantic tokens/utilities in `src/styles.css`; avoid component-level hardcoded glass colors and shadows.
- Preserve thread creation/history/deletion, streaming, abort, interview grounding, consent, recording, transcription, and analysis navigation.

## Verification
- Check empty, focused, multiline, submitted, streaming, stopped, and post-send-reset composer states.
- Confirm Enter sends, Shift+Enter inserts a line break, composition input is not submitted prematurely, and auto-resize caps correctly.
- Verify no resting-state overlap at wide desktop, narrow desktop/tablet, and phone widths; confirm the phone capture tab can still open and close the panel.
- Run focused type/lint checks and inspect the rendered dashboard in both normal and reduced-motion modes.
