---
"@open-codesign/desktop": patch
"@open-codesign/runtime": patch
"@open-codesign/shared": patch
---

Keep canvas comments tied to the host-resolved preview source file, including dedicated file tabs and persisted session comments. Edit prompts now use pi's read/edit tools and describe DOM targets as evidence rather than exact source-code locations; imported components still require source inspection.

Correct duplicate/special-character ID selection and nested SVG rectangle tracking, preserve existing outlines, and clear stale selection when the selected layer disappears or the preview changes. Store comment rectangles in unscaled iframe coordinates and reject malformed geometry messages.
