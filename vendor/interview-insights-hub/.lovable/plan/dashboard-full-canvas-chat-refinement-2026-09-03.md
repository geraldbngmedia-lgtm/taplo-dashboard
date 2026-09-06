# Dashboard full-canvas chat refinement

## Goal
Transform `/dashboard` into the selected **Minimal canvas workspace**: a spacious, Taplo-warm conversational screen inspired by the references, while preserving the existing Taplo sidebar and all current chat functionality.

## Changes
1. **Simplify the dashboard canvas**
   - Remove the Dashboard page header, stats, and today’s meetings from the dashboard route.
   - Let Ask Taplo fill the available content area without introducing a second navigation rail.
   - Leave the app sidebar and floating capture panel unchanged.

2. **Recompose the empty chat state**
   - Center a restrained Taplo greeting and supporting line in the open canvas.
   - Present the existing three prompt suggestions as lightweight warm-surface actions.
   - Use the selected warm palette and current Plus Jakarta Sans typography.

3. **Create the adaptive composer**
   - Start as a centered, pill-like composer in the empty state.
   - Transition smoothly to a bottom dock once a conversation begins.
   - Preserve submit, stop, keyboard, streaming, error, and disabled behavior from the current AI Elements implementation.

4. **Refine active conversations**
   - Use a narrow, centered reading column similar to the reference.
   - Keep assistant responses directly on the canvas with no bubble; use a subtle high-contrast surface for user messages.
   - Add lightweight access to new conversation and thread history without restoring the permanent internal thread rail.
   - Keep interview-context grounding, stored threads, deletion, suggestions, and API behavior unchanged.

5. **Motion and responsive behavior**
   - Add subtle fade/vertical transitions for the greeting, messages, and composer repositioning.
   - Respect reduced-motion preferences.
   - Ensure the layout remains usable on narrower desktop and mobile widths without overlapping the floating capture panel.

## Technical details
- Continue composing the chat from the installed AI Elements primitives (`Conversation`, `Message`, `PromptInput`, and `Shimmer`).
- Use only the existing semantic tokens in `src/styles.css`; add semantic glass/motion tokens there only if the selected composition requires them.
- Restrict implementation to the dashboard route and dashboard assistant presentation; do not alter chat persistence, context construction, or the chat API.

## Verification
- Run the project typecheck and relevant automated checks.
- Verify empty, active, streaming, stop, new-thread, history, and delete-thread states in the live dashboard.
- Capture and inspect the dashboard at 1440×900 plus a narrow viewport for spacing, readability, composer placement, and overlap.
