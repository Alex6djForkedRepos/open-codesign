---
"@open-codesign/desktop": patch
---

Keep fresh and partially seeded profiles compatible with filesystems that do not
support hard links by exclusively copying missing method files. Never replace a
concurrently created file or weaken guarded updates and recovery.
