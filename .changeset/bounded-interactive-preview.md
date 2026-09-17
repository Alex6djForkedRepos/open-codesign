---
"@open-codesign/core": patch
"@open-codesign/desktop": patch
---

Add optional viewport and bounded click, fill, keyboard, and assertion steps to preview. Report ordered interaction evidence and the final visible screen so connected products can verify shared state and navigation before completion. Existing render-only calls remain supported; checks run in an isolated disposable browser and do not promise persistence or coverage of untested flows.
