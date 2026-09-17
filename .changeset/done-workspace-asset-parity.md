---
"@open-codesign/core": patch
"@open-codesign/desktop": patch
---

Pass optional source-path context to runtime verification and resolve local assets against the latest bound workspace under the workspace path lock. Preview and done share safe file access and source-relative base URLs, including nested source files. Missing or out-of-workspace assets still fail and now identify the requested resource URL.
