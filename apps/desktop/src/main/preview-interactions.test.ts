import { afterEach, describe, expect, it, vi } from 'vitest';
import { boundedPreview, runPreviewSteps } from './preview-interactions';

afterEach(() => vi.useRealTimers());

describe('preview interaction budgets', () => {
  it('bounds a hung browser operation and removes its cancellation listener', async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const remove = vi.spyOn(controller.signal, 'removeEventListener');
    const promise = boundedPreview(new Promise<never>(() => {}), 2000, controller.signal);
    const assertion = expect(promise).rejects.toThrow('timed out');
    await vi.advanceTimersByTimeAsync(2000);
    await assertion;
    expect(remove).toHaveBeenCalledWith('abort', expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels a hung browser operation and clears its timer', async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const promise = boundedPreview(new Promise<never>(() => {}), 2000, controller.signal);
    const assertion = expect(promise).rejects.toThrow('cancelled');
    controller.abort();
    await assertion;
    expect(vi.getTimerCount()).toBe(0);
  });

  it('caps the entire sequence at twenty seconds even when individual assertions eventually pass', async () => {
    vi.useFakeTimers();
    const page = {
      evaluate: vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1900));
        return { ok: true };
      }),
      mouse: { click: vi.fn() },
      keyboard: { press: vi.fn() },
    };
    const result = runPreviewSteps(
      page,
      Array.from({ length: 16 }, () => ({
        action: 'assert' as const,
        selector: '#ready',
        visible: true,
      })),
    );
    await vi.advanceTimersByTimeAsync(20_000);
    const steps = await result;
    expect(steps).toHaveLength(11);
    expect(steps.slice(0, 10).every((step) => step.ok)).toBe(true);
    expect(steps[10]).toMatchObject({ ok: false, reason: expect.stringContaining('timed out') });
  });
});
