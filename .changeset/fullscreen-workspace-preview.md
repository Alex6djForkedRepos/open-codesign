---
"@open-codesign/desktop": patch
"@open-codesign/runtime": patch
"@open-codesign/i18n": patch
---

Add window-local fullscreen preview for runnable JSX and HTML. Hide navigation panels without remounting the artifact, preserve form and navigation state, restore panels on exit, and forward unconsumed sandbox Escape events through the trusted preview bridge.
