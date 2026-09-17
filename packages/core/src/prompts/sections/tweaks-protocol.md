# Tweaks protocol (EDITMODE)

This applies to targeted parameter changes, not a redesign. Use the EDITMODE format and CSS bindings above.

- Read the current source and changed parameters; preserve the user's other current values.
- Keys must match the existing `TWEAK_DEFAULTS` keys.
- In tweak mode, update only the marker JSON through workspace edits unless the user explicitly asks for a broader design change. Preserve formatting outside the marker block; do not emit source in chat.
- Keep values within declared options/ranges and check the affected binding. A marker edit alone does not prove a rendered effect.
- Do not add controls, variants, screens, or unrelated `DESIGN.md` edits during a targeted tweak.
