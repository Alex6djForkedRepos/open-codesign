// @vitest-environment happy-dom

import { initI18n } from '@open-codesign/i18n';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { AskRequest } from '../../../preload/index';
import { useCodesignStore } from '../store';
import { AskModal } from './AskModal';

beforeAll(() => initI18n('en'));

afterEach(() => {
  Reflect.deleteProperty(window, 'codesign');
  vi.unstubAllGlobals();
});

describe('clarification visibility in a collapsible sidebar', () => {
  it('reveals a new question but does not cancel a hidden question or an IME composition', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn(() => 1),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    const initial = useCodesignStore.getState();
    const revealChat = vi.fn();
    const leaveFullscreen = vi.fn();
    const resolve = vi.fn();
    let emit: ((request: AskRequest) => void) | undefined;
    Object.defineProperty(window, 'codesign', {
      configurable: true,
      value: {
        ask: {
          onRequest: (handler: (request: AskRequest) => void) => {
            emit = handler;
            return () => {};
          },
          pending: async () => [],
          resolve,
        },
      },
    });
    useCodesignStore.setState({
      sidebarCollapsed: true,
      previewFullscreen: true,
      setSidebarCollapsed: revealChat,
      setPreviewFullscreen: leaveFullscreen,
    });
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    try {
      await act(async () => root.render(<AskModal />));
      await act(async () => {
        emit?.({
          requestId: 'visibility-question',
          sessionId: 'fixture-design',
          input: { questions: [{ id: 'q1', type: 'freeform', prompt: 'Required information' }] },
        });
      });
      expect(revealChat).toHaveBeenCalledWith(false);
      expect(leaveFullscreen).toHaveBeenCalledWith(false);
      const panel = container.querySelector('section');
      expect(panel).not.toBeNull();
      if (!panel) throw new Error('Missing clarification panel');
      const rectangles = vi.spyOn(panel, 'getClientRects');
      rectangles.mockReturnValue(Object.assign([], { item: () => null }));
      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });
      expect(resolve).not.toHaveBeenCalled();
      const rect = new DOMRect(0, 0, 200, 100);
      rectangles.mockReturnValue(
        Object.assign([rect], { item: (index: number) => (index === 0 ? rect : null) }),
      );
      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', isComposing: true }));
        const consumed = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
        consumed.preventDefault();
        window.dispatchEvent(consumed);
      });
      expect(resolve).not.toHaveBeenCalled();
      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });
      expect(resolve).toHaveBeenCalledWith('visibility-question', {
        status: 'cancelled',
        answers: [],
      });
    } finally {
      await act(async () => root.unmount());
      container.remove();
      useCodesignStore.setState(initial, true);
    }
  });
});
