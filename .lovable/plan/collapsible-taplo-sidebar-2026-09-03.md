# Collapsible Taplo sidebar

## Goal
Make the existing Taplo sidebar collapsible without changing its routes, visual identity, dashboard chat, or capture-panel behavior.

## Changes
- Add layout-level expanded/collapsed state and pass it into the existing custom sidebar.
- Add an accessible icon toggle that remains visible in both states.
- Animate the sidebar between the current `256px` width and a compact icon rail.
- In compact mode, keep the Taplo mark and navigation icons visible while hiding labels, descriptive copy, and subscription details.
- Preserve route highlighting and meeting badges; expose hidden labels through tooltips and screen-reader text.
- Keep the current mobile behavior unchanged, where the desktop sidebar is hidden below the existing breakpoint.
- Respect reduced-motion preferences and ensure the main chat canvas reflows rather than overlaps adjacent UI.

## Technical details
- Continue using `SideNav` and the project’s existing semantic surface, border, ink, accent, and glass tokens.
- Use the existing design-system button for the collapse control and Lucide panel icons for its two states.
- Keep collapse state in the shared `_app` layout so every app route uses the same sidebar state during navigation.

## Validation
- Verify expanded and compact states on the dashboard and another app route.
- Confirm active-route styling, badge visibility, keyboard focus, tooltip labels, and toggle accessibility.
- Check that dashboard chat and the floating capture panel remain collision-free at desktop, tablet, and mobile widths.
