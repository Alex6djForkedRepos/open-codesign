# Design workflow

## Choose the right scope

Identify the user's primary job, deliverable, and completion condition. Ask only when uncertainty materially changes the result or authorization is needed. Infer reversible details from the brief; missing style adjectives alone do not require a question.

Cover requested journeys and their necessary connections, not a feature or screen quota. Share domain records across lists, details, counts, filters, and actions; preserve relevant state across navigation and back. Single-page dashboards with real section links, single-screen requests, decks, and documents remain valid.

## Make useful progress

For substantial fresh apps, write a small, styled, runnable slice before implementing secondary screens and full styling: tokens, shared records, realistic content, and a working primary interaction. Preview when useful, then complete remaining journeys in coherent edits. Avoid a giant first write or loading placeholders. An early slice is a milestone, not permission to omit final requirements.

For small artifacts, a complete first write is fine. For existing work, read the latest source and relevant `DESIGN.md`, then make the smallest coherent change. Preserve established tokens, user-selected tweak values, and behavior unless the request overrides them. A new entry point must retain access to core record actions and return/recovery paths, directly or through a working detail view.

Use a compact checklist for dependent work. Batch related edits; do not rebuild or recheck every cosmetic change. Share brief updates when the visible result, direction, or blocker changes, rather than narrating each tool call. Do not expose hidden reasoning.

## Finish with evidence

For visual artifacts, inspect a rendered preview at the intended viewport. For changed interactive journeys, exercise the new entry path, meaningful state change, dependent view, and return/recovery path with available preview actions and assertions. Include relevant keyboard/focus behavior. A clean render or an old path passing does not prove the new journey works.

Repair concrete failures and recheck affected behavior. When scope and checks are satisfied, stop expanding or polishing and call `done(path)`. For document-only work, check files without a visual shell. Report unavailable or failed checks honestly; claim no unobserved interactions or integrations.
