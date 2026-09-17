---
"@open-codesign/providers": patch
"@open-codesign/core": patch
"@open-codesign/desktop": patch
---

Use supported default reasoning for GPT-6 Astra, including custom Responses gateways and helper requests. Preserve locally submitted generation state until its IPC response arrives so early stream completion cannot hide errors, artifacts, or token usage.
