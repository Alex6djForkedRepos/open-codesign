---
schemaVersion: 1
name: craft-polish
description: >
  Integrates interaction and craft details that prevent generic AI UI:
  real clickable states, view transitions, empty states, rhythm breaks, and
  component-reference self-checks. Use before final `done`.
aliases: [polish, interaction-polish, final-pass, craft-pass]
dependencies: []
validationHints:
  - final artifact includes focus and hover states for actions
  - operational surfaces include empty loading or error states
trigger:
  providers: ['*']
  scope: system
disable_model_invocation: false
user_invocable: true
---

## Interactive Minimum

Integrate craft into implementation, then audit before `done`; do not schedule automatic extra polish rounds. For app/tool surfaces, every clickable element must perform its implied action. Changing a record must update dependent views; a toast alone is not completion. Pure hover does not count. Omit unnecessary controls or mark them unavailable with a reason. Static one-pagers need behavior only for their visible controls, not extra app screens.

Include:

- Observable completion of the core journey, with shared state across navigation and back.
- Restrained view transitions when useful, without delaying navigation.
- Hover, press, and focus styles on every action.
- One empty-state variant for a list, grid, table, chart, or inbox.
- Active navigation indicator that uses shape/weight, not color alone.

## Empty, Loading, Error

Every operational surface should include at least one non-happy-path state:

- Empty: explain what is missing, show one next action, and avoid sad blank panels.
- Loading: use skeletons that match the final layout, not generic gray bars.
- Error: include a human-readable cause and a retry or fallback action.
- Offline/disabled: use opacity plus text/shape, not color alone.

## Craft Surplus

Choose useful details that support the task, not a quota:

- Stateful badge or counter with a small animation.
- Keyboard shortcut chip.
- Copy feedback.
- Dismissible toast/banner.
- Tooltip with directional arrow.
- Relative-time tick.
- Segmented control.
- Accordion or drawer.
- Deliberate visual rhythm break.

## Motion And Focus

- Keep UI motion under 300ms, usually 120-200ms.
- Use `transform` and `opacity` for transitions; avoid layout-jank animations.
- Respect `prefers-reduced-motion` for looping or large movement.
- Focus rings must be visible on keyboard navigation.
- Hover and pressed states should change at least two cues: surface, border, shadow, icon, text weight, or transform.

## Final Self-Check

Before `done`:

- Audit every JSX `<PascalCase />` reference and confirm a matching component definition or runtime-provided component exists.
- Audit the default view plus hidden tabs, drawers, modals, and accordions. When the live preview tool supports interaction steps, exercise the primary path and assert the changed state after navigating back; a mental walkthrough is not an executed test.
- Check that no card, button, tab, chart, or list row shifts size unexpectedly on hover/state change.
- Remove debug labels, placeholder copy, "TODO", "lorem", fake filenames, and generic names.
- Ensure `TWEAK_DEFAULTS` exposes only meaningful controls, not every pixel.

## Human Design Decisions

When controls are requested or useful, expose 2-5 consequential choices after
the main behavior works, not before the first working frame. Prioritize the
largest useful visual differences: primary brand token, reading density,
type scale, card layout/emphasis, or content visibility. Do not add controls
or questions to narrow revisions, documents, or throwaway artifacts merely
to satisfy a quota.

- Ground the default in the brief and current source. Name the tradeoff,
  such as reading density with comfortable/compact options, rather than
  exposing implementation names or every padding value.
- Derive declarations from stable source. Every default must equal its
  rendered starting value; use meaningful enum options and safe number
  bounds/steps. Include only variants actually implemented in the source.
- Bind shared choices across relevant screens. Use `--ocd-tweak-*` CSS
  properties for visual values, not one-time reads that leave rendered
  styles unchanged. A number, enum, or boolean existing in JSON is not a
  binding; a layout/visibility variant needs working runtime behavior.
- Do not imply backend, authentication, or payment capability with a switch.
  Do not promise arbitrary cross-file updates from `tweaks()`; it discovers
  declared values rather than implementing their consumers.
- Preserve the user's current knob choices through later edits unless the
  request overrides them. Read the latest source before changing defaults.

### Source Declaration

The panel humanizes camelCase keys; enum options are plain strings, not
label/value objects. Explain the tradeoff briefly in the handoff rather than
inventing schema label fields. For source that actually implements these
choices, the existing declaration format is:

```js
const TWEAK_SCHEMA = /*TWEAK-SCHEMA-BEGIN*/{
  "density": { "kind": "enum", "options": ["comfortable", "compact"] },
  "gap": { "kind": "number", "min": 8, "max": 32, "step": 2, "unit": "px" },
  "showNotes": { "kind": "boolean" }
}/*TWEAK-SCHEMA-END*/;
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "comfortable",
  "gap": 16,
  "showNotes": true
}/*EDITMODE-END*/;
```

Schema keys must match the declared defaults. Use `kind: "color"` for color
controls; do not turn arbitrary strings into enum choices without implementing
them. Structural JSX may consume `TWEAK_DEFAULTS` when the runtime reruns it
with updated values; for example, `showNotes` must actually govern the notes
content and `density` must select implemented layouts. Ordinary visual values
should still use CSS custom properties. Do not copy this declaration into
unbound source merely to populate a panel.

### Check The Actual Effect

Audit each declared key through its consumers, including dependent screens.
Check representative alternate values and range boundaries for their intended
visual effect and readable layouts, then restore the user's defaults.
If controls exist inside the artifact, use available preview steps to change
them and assert the effect. Otherwise, use focused source edits to the exact
bound values and preview the alternate, then restore and recheck the original.
Do not leave a test value in the final source.

Artifact preview cannot click the host tweak panel. A source-binding audit or
previewed source variant does not prove host-panel interaction or persistence;
state that limit honestly. Do not add fake in-artifact controls just to claim
the host panel was tested.

## Bounded Preview Check

If the live `preview` schema supports `viewport` and `steps`, use unique
selectors from the actual source and explicit assertions. For example, for
a task app whose source defines these IDs:

```json
{
  "path": "App.jsx",
  "viewport": { "width": 390, "height": 844 },
  "steps": [
    { "action": "fill", "selector": "#new-task", "value": "Buy milk" },
    { "action": "click", "selector": "#add-task" },
    { "action": "assert", "selector": "#task-list", "text": "Buy milk" },
    { "action": "click", "selector": "#settings" },
    { "action": "assert", "selector": "#settings-title", "visible": true },
    { "action": "click", "selector": "#back" },
    { "action": "assert", "selector": "#task-list", "text": "Buy milk" }
  ]
}
```

Keep each call within the tool's step limit. Use `press` with `Enter`,
`Escape`, or `Tab` for supported keyboard checks. Text assertions match
contained text; value assertions match exact input values. Inspect the
structured step results, not just console errors or the final screenshot.
Repair concrete failures and recheck the affected path. Separate calls may
reset state; they do not prove persistence. If steps are unavailable, disclose
that interactions were not exercised instead of claiming they passed.
