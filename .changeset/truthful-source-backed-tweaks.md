---
'@open-codesign/desktop': patch
'@open-codesign/core': patch
'@open-codesign/i18n': patch
'@open-codesign/shared': patch
---

Explain missing, empty, or invalid tweak declarations for the active preview
source instead of promising automatic controls. Surface malformed declarations
without crashing the panel. Clarify that the tweaks scanner only discovers
declarations: unrelated starter values are not controls for the active preview.
