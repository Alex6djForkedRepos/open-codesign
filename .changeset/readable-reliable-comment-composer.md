---
"@open-codesign/desktop": patch
"@open-codesign/i18n": patch
---

Make canvas comments easier to read and operate with labeled primary actions, larger click targets, responsive composer placement, and comment-list actions that do not cover comment text.

Cancel, close, and Escape now dismiss without saving, retaining the existing anchor-scoped draft. IME composition no longer triggers keyboard submission or dismissal. Saving prevents duplicate requests, shows progress and retry feedback, and returns focus after failure. A late save cannot close a newer comment anchor or queue its comment in a different design.
