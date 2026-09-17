---
"@open-codesign/exporters": patch
"@open-codesign/desktop": patch
---

Resolve literal local asset references before JSX/TSX is encoded into standalone
HTML. HTML and browser-rendered exports now inline these assets, while ZIP exports
collect and rebase them without changing the included editable source. Preserve
CSS URL quoting and safely encode text assets in quoted attributes.
