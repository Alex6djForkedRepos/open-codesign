import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadSkillsFromDir } from '../skills/loader.js';
import { composeSystemPrompt } from './index.js';

describe('connected product prompt contract', () => {
  it('plans bounded journeys and shared data rather than disconnected screens', () => {
    const prompt = composeSystemPrompt({ mode: 'create' });
    for (const contract of [
      'unless explicitly single-screen',
      'bounded local interactive prototype',
      'core user journey',
      'screen/state map',
      'observable completion condition',
      'shared domain data at the app root',
      'Navigation, back, and selection must preserve that data',
      'create/edit/complete/filter actions must visibly update dependent views',
      'validation, empty, and success states',
      'No dead navigation or buttons',
      'contained focus while modal',
      'focus restoration on close',
      'source asset, not a deliverable ceiling',
    ]) {
      expect(prompt, contract).toContain(contract);
    }
  });

  it('keeps readable prototype source and truthful local service boundaries', () => {
    const prompt = composeSystemPrompt({ mode: 'create' });
    for (const contract of [
      'one coherent `App.jsx` unless a real multi-file need exists',
      'readable, named components and formatted JSX',
      'focused component-sized edits',
      'check balanced tags/braces',
      'not a production service',
      'Clearly label simulated data, network, payment, and authentication behavior',
      'Do not add backend setup, installs, or network access',
      'in-memory state by default',
      'Only attempt persistence when requested and supported',
      'sandbox `localStorage` may be denied',
      'handle storage failures without crashing',
    ]) {
      expect(prompt, contract).toContain(contract);
    }
  });

  it('requires a capability-aware journey check and repair before finalization', () => {
    const prompt = composeSystemPrompt({ mode: 'create' });
    for (const contract of [
      'Preview the initial screen and a relevant target viewport',
      'When the live `preview` schema supports `viewport` and `steps`',
      'click/fill/press actions and explicit assertions',
      'inspect a dependent view, navigate back',
      'unique selectors from the actual source',
      'separate preview calls may reset state',
      'repair concrete problems, and recheck the affected path',
      'Clean runtime output is not proof of working interactions',
      'disclose that behavior was not exercised',
      'audit the requested behavior and call `done(path)`',
    ]) {
      expect(prompt, contract).toContain(contract);
    }
  });

  it('delivers runnable milestones without dropping final scope or forcing extra rounds', () => {
    const prompt = composeSystemPrompt({ mode: 'create' });
    for (const contract of [
      'For substantial fresh app/product work',
      'a few meaningful, runnable checkpoints',
      'write this small renderable checkpoint early',
      'primary navigation state, shared records, and an initial screen',
      'a small realistic dataset',
      'Save this valid slice before implementing secondary screens or full styling',
      'defer their code, not syntax closure',
      'edit the working frame',
      'then exercise the core flow',
      'Recheck affected behavior and the target viewport before `done`',
      'not three mandatory extra rounds',
      'avoid per-line tool churn or repeated full rewrites',
      'An early frame preview proves rendering only',
      'never stop at a pretty skeleton or silently drop planned journeys',
      'each create/edit must leave a syntactically valid, renderable file',
      'Never save unclosed JSX or half a component',
      'Single-screen, document, deck, and narrow revision requests do not need',
      'Never use "Loading", "Generating", gray skeleton blocks',
    ]) {
      expect(prompt, contract).toContain(contract);
    }
    expect(prompt).not.toContain('Preview the complete pass');
    expect(prompt).not.toContain('focused edits to a complete first pass, then `preview(App.jsx)`');
  });

  it('checks newly reachable record actions without restarting the working app', () => {
    const prompt = composeSystemPrompt({ mode: 'revise' });
    expect(prompt).toContain(
      'New destinations must retain core record actions and a return/recovery path, not merely render',
    );
    expect(prompt).toContain(
      'Reuse the working app; batch related edits and check changed paths, not every cosmetic edit',
    );
    expect(prompt).toContain('make the minimum coherent change');
    expect(prompt).not.toContain('My Bookings');
  });

  it('prioritizes implemented design decisions without delaying the first frame', () => {
    const prompt = composeSystemPrompt({ mode: 'create' });
    for (const contract of [
      'Once broad behavior works, expose useful source-backed design decisions as tweaks',
      'never delay the first working frame for controls',
      'Prefer 2-5 consequential choices',
      'primary brand token, density, type scale, layout/emphasis, or content visibility',
      'not pixel-by-pixel knobs',
      'Defaults must match actual source and the brief',
      'meaningful labels/options and safe ranges',
      'Bind each choice across relevant screens through shared tokens',
      'Structural variants must be implemented and supported',
      '`tweaks()` discovers values; it does not create bindings',
      'Check representative alternatives and restore defaults',
      'Artifact preview cannot click the host tweak panel',
      "Preserve the user's current values through later agent edits",
      'not by assuming automatic tweak-tool updates',
    ]) {
      expect(prompt, contract).toContain(contract);
    }
    expect(prompt).not.toContain('TWEAK-SCHEMA-BEGIN');
  });

  it('keeps targeted tweaks in workspace marker edits rather than redesign or source in chat', () => {
    const prompt = composeSystemPrompt({ mode: 'tweak' });
    expect(prompt).toContain("preserve the user's other current values");
    expect(prompt).toContain('update only the marker JSON through workspace edits');
    expect(prompt).toContain('Preserve formatting outside the marker block');
    expect(prompt).toContain('do not emit source in chat');
    expect(prompt).toContain('A marker edit alone does not prove a rendered effect');
    expect(prompt).toContain(
      'Do not add controls, variants, screens, or unrelated `DESIGN.md` edits during a targeted tweak',
    );
    expect(prompt).not.toContain('Re-emit the full artifact');
  });

  it.each([
    'create',
    'revise',
    'tweak',
  ] as const)('%s preserves narrow scope and the compact, progressively disclosed prompt', (mode) => {
    const prompt = composeSystemPrompt({ mode });
    expect(prompt).toContain(
      'Do not expand single-page, deck, document, or narrow revision requests into apps',
    );
    expect(prompt).toContain('never to meet a screen count');
    expect(prompt).toContain('not automatic extra polish rounds');
    expect(prompt).toContain('make the minimum coherent change');
    expect(prompt).toContain('Do not add unrelated screens or restart the full creation workflow');
    expect(prompt).toContain('For document-first requests');
    expect(prompt).toContain('Before a second screen');
    expect(prompt).toContain('scaffold({kind, destPath})');
    expect(prompt).not.toContain('## Bounded Preview Check');
    expect(prompt).not.toContain('"selector": "#new-task"');
    // A character budget (~5.5k tokens at 4 chars/token), not a tokenizer measurement.
    expect(prompt.length).toBeLessThanOrEqual(22_000);
  });
});

describe('connected product builtin method contracts', () => {
  it('loads coherent journey guidance without extra screens or craft quotas', async () => {
    const skills = await loadSkillsFromDir(
      fileURLToPath(
        new URL('../../../../apps/desktop/resources/templates/skills', import.meta.url),
      ),
      'builtin',
    );
    const contracts: Record<string, string[]> = {
      'app-shell-navigation': [
        'stable IDs and derived counts',
        'Returning from a detail',
        'Omit unnecessary destinations',
        'Trace each new navigation item from its actual control',
        '`href="#"`, an invented URL, or a 404 is not a destination',
        'disable it with a reason',
        'Real `#section-id` links to existing sections are valid',
        'do not turn section navigation into unnecessary separate screens',
        'directly',
        'through a working detail link',
        'must not strand the existing Cancel action',
        'return to',
        'the originating list with updated status',
      ],
      'mobile-mock': [
        'shared app-root',
        'not a mandatory tab or screen count',
        'Do not claim',
        'in-memory changes may reset on reload',
        'do not add a duplicate bar or inset',
      ],
      'artifact-composition': [
        'connected screens and shared state',
        'no fixed screen count or decorative dashboard metrics',
        'not a ceiling on product behavior',
        'do not pad simple apps to a field quota',
      ],
      'craft-polish': [
        'do not schedule automatic extra polish rounds',
        'a toast alone is not completion',
        'a mental walkthrough is not an executed test',
        'structured step results',
        'If steps are unavailable, disclose',
        'safe number',
        'variants actually implemented',
        'Do not imply backend, authentication, or payment capability with a switch',
        'Artifact preview cannot click the host tweak panel',
        'Do not leave a test value in the final source',
        'enum options are plain strings',
        'Structural JSX may consume `TWEAK_DEFAULTS`',
        'Do not copy this declaration into',
        'Passing checks on the old confirmation screen does not prove actions are reachable from a new list',
        'do not repeat the whole app suite after every cosmetic edit',
      ],
      'design-system-baton': [
        'Treat current user-selected tweak values as design decisions',
        'During broader agent edits',
        'explicitly synchronize',
        'does not automatically update unbound files',
        'For a targeted marker-only tweak, preserve unrelated files',
      ],
      'accessibility-states': [
        'focus restoration to the opener',
        'preserve entered',
        'not a disconnected showcase',
        'not presented as completed real operations',
      ],
    };
    for (const [id, phrases] of Object.entries(contracts)) {
      const skill = skills.find((candidate) => candidate.id === id);
      expect(skill, id).toBeDefined();
      for (const phrase of phrases) {
        expect(skill?.body, `${id}: ${phrase}`).toContain(phrase);
      }
    }
    const craft = skills.find((skill) => skill.id === 'craft-polish');
    expect(craft?.body).not.toContain('At least 3 observable state changes');
    expect(craft?.body).not.toContain('Add at least 3 small details');
    const schema = craft?.body.match(
      /\/\*TWEAK-SCHEMA-BEGIN\*\/([\s\S]*?)\/\*TWEAK-SCHEMA-END\*\//,
    )?.[1];
    const defaults = craft?.body.match(/\/\*EDITMODE-BEGIN\*\/([\s\S]*?)\/\*EDITMODE-END\*\//)?.[1];
    if (!schema || !defaults) throw new Error('Missing source-backed tweak declaration example');
    expect(JSON.parse(schema)).toEqual({
      density: { kind: 'enum', options: ['comfortable', 'compact'] },
      gap: { kind: 'number', min: 8, max: 32, step: 2, unit: 'px' },
      showNotes: { kind: 'boolean' },
    });
    expect(JSON.parse(defaults)).toEqual({
      density: 'comfortable',
      gap: 16,
      showNotes: true,
    });
    const example = craft?.body.match(/```json\n([\s\S]*?)\n```/)?.[1];
    expect(example).toBeDefined();
    if (!example) throw new Error('Missing bounded preview example');
    expect(JSON.parse(example)).toEqual({
      path: 'App.jsx',
      viewport: { width: 390, height: 844 },
      steps: [
        { action: 'fill', selector: '#new-task', value: 'Buy milk' },
        { action: 'click', selector: '#add-task' },
        { action: 'assert', selector: '#task-list', text: 'Buy milk' },
        { action: 'click', selector: '#settings' },
        { action: 'assert', selector: '#settings-title', visible: true },
        { action: 'click', selector: '#back' },
        { action: 'assert', selector: '#task-list', text: 'Buy milk' },
      ],
    });
  });
});
