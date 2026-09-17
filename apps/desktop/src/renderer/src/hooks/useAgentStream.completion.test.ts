import { initI18n } from '@open-codesign/i18n';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AgentStreamEvent } from '../../../preload/index';
import { type CodesignState, useCodesignStore } from '../store';
import { useAgentStream } from './useAgentStream';

const { cleanups } = vi.hoisted(() => ({ cleanups: [] as Array<() => void> }));

vi.mock('react', async () => ({
  ...(await vi.importActual<typeof import('react')>('react')),
  useEffect: (effect: () => undefined | (() => void)) => {
    const cleanup = effect();
    if (cleanup) cleanups.push(cleanup);
  },
  useRef: (current: unknown) => ({ current }),
}));

vi.mock('../store', async () => {
  const actual = await vi.importActual<typeof import('../store')>('../store');
  return {
    ...actual,
    useCodesignStore: Object.assign(
      (selector: (state: CodesignState) => unknown) => selector(actual.useCodesignStore.getState()),
      actual.useCodesignStore,
    ),
  };
});

const initialState = useCodesignStore.getState();
const design = {
  schemaVersion: 1 as const,
  id: 'completion-test',
  name: 'Aurora',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  thumbnailText: null,
  deletedAt: null,
  workspacePath: '/tmp/codesign-completion-test',
};
let listener: ((event: AgentStreamEvent) => void) | undefined;
const append = vi.fn(async (input: { designId: string; kind: string; payload: unknown }) => ({
  ...input,
  id: 'row',
  seq: 1,
  createdAt: new Date().toISOString(),
}));
const generate = vi.fn();

function emit(
  type: AgentStreamEvent['type'],
  generationId: string,
  extra: Partial<AgentStreamEvent> = {},
): void {
  if (!listener) throw new Error('Agent stream listener not registered');
  listener({
    type,
    generationId,
    designId: design.id,
    message: '400 unsupported reasoning',
    ...extra,
  });
}

beforeAll(async () => {
  await initI18n('en');
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  useCodesignStore.setState({
    ...initialState,
    config: {
      hasKey: true,
      provider: 'custom-local',
      modelPrimary: 'gpt-6-astra',
      baseUrl: null,
      designSystem: null,
    },
    configLoaded: true,
    designs: [design],
    designsLoaded: true,
    currentDesignId: design.id,
    persistAgentRunSnapshot: vi.fn(async () => {}),
    tryAutoPolish: vi.fn(),
  });
  vi.stubGlobal('window', {
    setTimeout,
    codesign: {
      generate,
      generationStatus: vi.fn(async () => ({ schemaVersion: 1, running: [] })),
      snapshots: {
        list: vi.fn(async () => []),
        create: vi.fn(async () => ({ id: 'snapshot' })),
        setThumbnail: vi.fn(async () => design),
        listDesigns: vi.fn(async () => [design]),
      },
      chat: {
        append,
        list: vi.fn(async () => []),
        seedFromSnapshots: vi.fn(async () => {}),
        onAgentEvent: (callback: (event: AgentStreamEvent) => void) => {
          listener = callback;
          return () => {
            listener = undefined;
          };
        },
      },
    },
  });
  useAgentStream();
});

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('agent stream / IPC completion ordering', () => {
  it.each([
    'agent_end',
    'error',
  ] as const)('shows the IPC failure even when %s arrives first', async (eventType) => {
    generate.mockImplementationOnce(async ({ generationId }: { generationId: string }) => {
      emit('turn_start', generationId);
      emit(eventType, generationId);
      expect(useCodesignStore.getState().generationByDesign[design.id]).toMatchObject({
        generationId,
        awaitingResponse: true,
      });
      throw new Error('400 unsupported reasoning');
    });

    await useCodesignStore.getState().sendPrompt({ prompt: 'Create an Aurora design' });

    expect(useCodesignStore.getState().errorMessage).toContain('400 unsupported reasoning');
    expect(useCodesignStore.getState().generationStage).toBe('error');
    expect(useCodesignStore.getState().isGenerating).toBe(false);
    expect(append.mock.calls.filter(([row]) => row.kind === 'error')).toHaveLength(1);
    expect(useCodesignStore.getState().toasts).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1500);
    expect(useCodesignStore.getState().tryAutoPolish).not.toHaveBeenCalled();
  });

  it('retains artifacts and usage from the response after agent_end', async () => {
    generate.mockImplementationOnce(async ({ generationId }: { generationId: string }) => {
      emit('turn_start', generationId);
      emit('agent_end', generationId);
      return {
        artifacts: [{ content: '<main>Aurora</main>', entryPath: 'App.jsx' }],
        message: 'Ready',
        inputTokens: 100,
        outputTokens: 200,
        costUsd: 0,
      };
    });

    await useCodesignStore.getState().sendPrompt({ prompt: 'Create an Aurora design' });

    expect(useCodesignStore.getState().previewSource).toBe('<main>Aurora</main>');
    expect(useCodesignStore.getState().lastUsage).toMatchObject({
      inputTokens: 100,
      outputTokens: 200,
    });
    expect(useCodesignStore.getState().isGenerating).toBe(false);
    await vi.advanceTimersByTimeAsync(1500);
    expect(useCodesignStore.getState().tryAutoPolish).toHaveBeenCalledWith(design.id, 'en');
  });

  it('still finishes a rehydrated run that has no pending local response', () => {
    useCodesignStore.getState().markGenerationRunning(design.id, 'rehydrated');
    emit('agent_end', 'rehydrated');

    expect(useCodesignStore.getState().generationByDesign[design.id]).toBeUndefined();
    expect(useCodesignStore.getState().isGenerating).toBe(false);
    expect(useCodesignStore.getState().generationStage).toBe('done');
  });

  it('does not lose a pending response when main already reports the run finished', async () => {
    generate.mockImplementationOnce(async ({ generationId }: { generationId: string }) => {
      emit('agent_end', generationId);
      await useCodesignStore.getState().syncGenerationStatus();
      throw new Error('late rejection');
    });
    await useCodesignStore.getState().sendPrompt({ prompt: 'Aurora' });
    expect(useCodesignStore.getState().errorMessage).toContain('late rejection');
  });

  it('ignores an old response after a newer run owns the design', async () => {
    generate.mockImplementationOnce(async ({ generationId }: { generationId: string }) => {
      emit('agent_end', generationId);
      useCodesignStore.getState().markGenerationRunning(design.id, 'newer-run');
      throw new Error('old error');
    });
    await useCodesignStore.getState().sendPrompt({ prompt: 'Aurora' });
    expect(useCodesignStore.getState().errorMessage).toBeNull();
    expect(useCodesignStore.getState().activeGenerationId).toBe('newer-run');
    expect(append.mock.calls.filter(([row]) => row.kind === 'error')).toHaveLength(0);
  });

  it('keeps a background response from replacing another design preview', async () => {
    generate.mockImplementationOnce(async ({ generationId }: { generationId: string }) => {
      emit('turn_start', generationId);
      useCodesignStore.setState({ currentDesignId: 'other-design', previewSource: 'Other' });
      emit('turn_end', generationId, { finalText: 'Ready' });
      emit('agent_end', generationId);
      return { artifacts: [{ content: '<main>Aurora</main>' }], message: 'Ready' };
    });
    await useCodesignStore.getState().sendPrompt({ prompt: 'Aurora' });
    expect(useCodesignStore.getState().previewSource).toBe('Other');
    expect(useCodesignStore.getState().previewSourceByDesign[design.id]).toBe(
      '<main>Aurora</main>',
    );
    expect(append.mock.calls.filter(([row]) => row.kind === 'assistant_text')).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1500);
  });
});
