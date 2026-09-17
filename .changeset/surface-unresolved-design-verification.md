---
"@open-codesign/core": patch
---

Report unresolved final design verification as GENERATION_INCOMPLETE, including repair-limit exhaustion and remaining verifier details, rather than returning an apparently successful result. Keep generated workspace files and session history available for inspection and retry.
