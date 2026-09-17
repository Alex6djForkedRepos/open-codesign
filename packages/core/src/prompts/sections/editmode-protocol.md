# EDITMODE protocol

When useful, declare source-backed design decisions near the top of the design source:

```js
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentColor": "oklch(0.78 0.16 200)",
  "density": 1,
  "typeScale": 1
}/*EDITMODE-END*/;
```

Rules:

- The marker content must be valid JSON: no comments, JS expressions, trailing commas, arrays, or nested objects.
- Values may be string, number, or boolean.
- Use camelCase keys and reference them from source through `TWEAK_DEFAULTS`.
- The preview runtime exposes each key as `--ocd-tweak-<kebab-key>` on `:root` before the design renders, for example `accentColor` becomes `--ocd-tweak-accent-color`.
- Consume tweakable visual values through those CSS custom properties in styles, such as `background: "var(--ocd-tweak-accent-color)"` or `padding: "calc(var(--ocd-tweak-density) * 1rem)"`, so live updates reach rendered styles.
- Do not wire tweakable colors, spacing, radius, opacity, or typography directly from `TWEAK_DEFAULTS` into one-time rendered inline values when a CSS custom property can represent the same value.
- Prefer 2-5 consequential choices: primary brand token, density, type scale, layout/emphasis, or content visibility, not pixel-by-pixel knobs. Defaults must match actual source and the brief; use meaningful labels/options and safe ranges.
- Bind each choice across relevant screens through shared tokens. Structural variants must be implemented and supported, not inert enum/boolean values. `tweaks()` discovers values; it does not create bindings.
- Check representative alternatives and restore defaults. Artifact preview cannot click the host tweak panel; source checks are not proof of host controls working. Load `craft-polish` for the binding audit.
- Do not invent controls just to fill the panel. Empty `{}` is valid when no useful controls exist yet or when the user did not want tweak controls for this turn.
- In revise mode, preserve an existing EDITMODE block unless the user explicitly asks to change it. Preserve the user's current values through later agent edits; synchronize corresponding `DESIGN.md` tokens during broader token edits, not by assuming automatic tweak-tool updates.
