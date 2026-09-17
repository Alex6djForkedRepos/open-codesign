---
schemaVersion: 1
name: mobile-mock
description: >
  Designs mobile UI mocks and prototypes with correct proportions and touch
  interactions. Use when building a mobile app screen, responsive mobile
  layout, or any prototype intended to be viewed on a phone (375px viewport).
  Enforces 44pt touch targets, proper status bar height, and safe area insets.
aliases: [mobile, iphone, ios, phone, 手机, 移动端]
dependencies: [artifact-composition, accessibility-states]
validationHints:
  - touch targets are at least 44px
  - screen respects mobile width and safe areas without fake device chrome unless requested
  - app journeys preserve shared state across tabs detail views and back navigation
trigger:
  providers: ['*']
  scope: system
disable_model_invocation: false
user_invocable: true
---

## Mobile Mock Design Standards

### Viewport and Frame
Output **only the screen contents** as if filling a 375×812 viewport (or 390×844 for iPhone 14+). The hosting environment provides the device frame, status bar, and home indicator — DO NOT render them yourself.

Specifically forbidden:
- Phone-shaped wrapper divs (rounded outer container, "bezel", "notch", "dynamic island")
- iOS status bar (9:41 time, signal/wifi/battery icons) — the host adds this
- Home indicator bar at the bottom — the host adds this
- Any explicit phone chrome rendering

Use `body { max-width: 390px; margin: 0 auto; min-height: 100vh; }` to constrain content width. Touch targets and spacing remain mobile-appropriate (44pt min target, 16-20px side padding).

If the user explicitly asks for a "phone mockup with frame" or "show the iPhone bezel", THEN you may render device chrome — otherwise default to bare screen contents.

### Touch Targets
Every interactive element must have a minimum tap target of **44×44px**. This is Apple HIG and Android Material specification. Apply it to buttons, list items, toggle switches, icon buttons, and navigation tabs. Use padding to extend small visual elements to the minimum tap size — do not enlarge the visual.

```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Status Bar
Respect the host-provided status bar; do not add a duplicate bar or inset. For an explicitly requested standalone device frame, reserve its status-bar space once and use safe-area insets where supported.

### Safe Area Insets
Bottom: reserve **34px** for the home indicator on notched iPhones. Use `padding-bottom: env(safe-area-inset-bottom, 34px)` on fixed bottom bars. Fixed bottom navigation must never overlap the home indicator.

### Typography Scale
Mobile type scale (base 16px):
- Display: 28–34px, weight 700, tight tracking (−0.02em)
- Headline: 20–24px, weight 600
- Body: 15–16px, weight 400, line-height 1.5
- Caption: 12–13px, weight 400, color muted

Never use type smaller than 12px on mobile — it fails WCAG SC 1.4.4 at normal viewing distance.

### Interaction Patterns
- No hover-only states. Mobile has no hover. Use `:active` for press feedback.
- Swipe gestures should have visual affordances (drag handles, chevrons).
- Bottom sheets and modals need a visible close/cancel action and keyboard dismissal; swipe-down or background tap may supplement these.
- Avoid right-click / long-press as the only way to access features.

### Spacing System
Use an 8px base grid. Standard padding: 16px (screen edges), 12px (card insets), 8px (between related elements), 4px (tight pairs). List item height: 48–56px for single-line, 64–72px for two-line items.

### Navigation
Bottom tab bar: 49–56px tall, 3–5 items max. Top navigation bar: 44–56px tall. Avoid hamburger menus — they hide navigation and reduce discoverability on mobile.

For an app rather than a single-screen request, connect the primary task,
supporting tabs, detail/edit surfaces, and back actions through shared app-root
state. Preserve selection and list context on return. Use only destinations
needed by the brief, not a mandatory tab or screen count. For a Todo app,
adding/editing/completing a task should update its detail, filtered lists, and
counts together; an empty filter needs a useful recovery action.

Preview at the intended phone viewport, including the core journey and its
changed state. Check that bottom navigation does not cover content or form
actions, and that dialogs remain usable on a short screen. Do not claim
cross-preview persistence; in-memory changes may reset on reload.
