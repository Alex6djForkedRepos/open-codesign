---
"@open-codesign/desktop": patch
---

Let the conversation sidebar collapse to a narrow, keyboard-accessible restore
rail. Keep chat and preview components mounted so drafts, active generation,
scroll position, and artifact interaction state survive collapse and expansion.
Preserve the previous sidebar width and hide the rail in fullscreen preview.
New clarification requests reveal the conversation, while Escape cannot
silently cancel a hidden question or cancel during IME composition.
