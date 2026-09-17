---
"@open-codesign/runtime": patch
---

Use system-ui instead of an implicitly downloaded DM Sans font for JSX previews and standalone exports. Request only supported Google Fonts families explicitly referenced by artifact source, with no font-service requests or preconnects for system-font designs. Explicit Fraunces, DM Serif Display, DM Sans and JetBrains Mono choices retain their existing styles.
