---
"@open-codesign/desktop": patch
---

Share in-flight startup design initialization so concurrent boot effects create only one blank design and workspace. Failed initialization remains retryable and continues to surface storage errors.
