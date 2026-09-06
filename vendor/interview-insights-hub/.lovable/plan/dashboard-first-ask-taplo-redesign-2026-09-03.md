# Dashboard-first Ask Taplo redesign

## Goal
Turn the dashboard into Taplo’s primary conversational workspace. Ask Taplo becomes the main first-page experience, while interview metrics and today’s meetings remain visible as compact supporting context. Remove the separate Chat item from the sidebar.

## Experience
- Place a large Ask Taplo conversation surface directly on `/dashboard`, with the existing interview-aware AI context and streaming responses.
- Use a focused empty state with Taplo branding, useful recruiter prompts, and a prominent composer that feels ready to type into immediately.
- Keep recent conversations available inside the dashboard experience rather than in the global sidebar, with create, select, and delete actions.
- Rebalance stats and today’s meetings into a quieter supporting column/band so chat clearly owns the page without losing daily operational context.
- Preserve existing thread history and behavior; opening `/` continues to land on the dashboard.

## Visual refinement
- Add restrained iPhone-like glass through semantic tokens: translucent warm surfaces, backdrop blur, subtle inner highlights, fine hairlines, and soft layered shadows.
- Keep Taplo’s warm Scandinavian palette and coral accent; avoid glossy gradients, excessive blur, or a full visual rebrand.
- Add smooth, purposeful motion for prompt selection, message arrival, streaming state, composer focus, thread switching, and panel transitions.
- Respect reduced-motion preferences and keep text contrast strong on translucent surfaces.

## Implementation
- Extract the existing chat thread UI into reusable dashboard-ready components, using AI Elements primitives for the conversation, messages, composer, and loading state while retaining Taplo-specific styling and the current `/api/chat` integration.
- Refactor the dashboard into the primary chat layout and connect it to the existing local thread store.
- Remove Ask Taplo from `SideNav`; keep existing chat URLs working as compatibility routes that redirect into the dashboard’s selected thread state rather than leaving dead links.
- Extend `src/styles.css` with semantic glass surface/shadow tokens and reusable motion styles; use Tailwind backdrop utilities for the frosted treatment.
- Add complete route-specific dashboard metadata (`description`, Open Graph, and Twitter fields) while touching the route.

## Validation
- Verify new chat, prompt suggestions, send, streaming, stop, thread switching, deletion, and retained history.
- Confirm the AI endpoint’s real response and visible error behavior remain intact.
- Check the dashboard at desktop and narrower responsive widths for clipping, overlap, readable glass contrast, and stable composer sizing.
- Run the project’s automated checks and inspect the finished dashboard in the browser, including reduced-motion behavior.
