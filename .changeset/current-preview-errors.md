---
"@open-codesign/desktop": patch
---

Clear obsolete runtime errors when the visible preview document changes, while
retaining errors from the current document. Background pooled previews no longer
affect this reset, and file-preview error listeners attach before rendering.
