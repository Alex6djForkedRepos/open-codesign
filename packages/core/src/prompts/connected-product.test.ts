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
