---
"@open-codesign/desktop": patch
"@open-codesign/i18n": patch
---

Add an explicit, localized no-API-key option for custom providers. Preserve key-required defaults, round-trip authentication mode through settings, discover opted-in keyless endpoints without credentials, and require a key when switching back to authenticated mode.
