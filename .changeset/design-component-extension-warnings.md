---
"@open-codesign/shared": patch
"@open-codesign/core": patch
"@open-codesign/desktop": patch
---

Preserve string-valued DESIGN.md component extensions with warnings, as required by Google's alpha consumer specification, rather than failing an otherwise working artifact. Keep malformed token values and runtime failures blocking and provide concrete object-shape repair guidance.

Surface non-blocking metadata warnings in done results and preserve error/warning counts through repeated stream/history compaction. Update the design-system method's portability guidance without silently rewriting user tokens or changing the repair limit.
