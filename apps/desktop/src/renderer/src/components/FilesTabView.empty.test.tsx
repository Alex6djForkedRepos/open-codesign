import { initI18n } from '@open-codesign/i18n';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLazyDesignFileTree } from '../hooks/useDesignFiles';
import { useCodesignStore } from '../store';
import { FilesTabView } from './FilesTabView';

vi.mock('../store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../store')>();
  return {
    ...actual,
    useCodesignStore: Object.assign(
      (selector: (state: ReturnType<typeof actual.useCodesignStore.getState>) => unknown) =>
        selector(actual.useCodesignStore.getState()),
      actual.useCodesignStore,
    ),
  };
});

vi.mock('../hooks/useDesignFiles', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../hooks/useDesignFiles')>()),
  useLazyDesignFileTree: vi.fn(),
}));

beforeAll(async () => {
  await initI18n('en');
});

beforeEach(() => {
  vi.stubGlobal('window', { innerWidth: 1280, localStorage: { getItem: () => null } });
  useCodesignStore.setState({ currentDesignId: null, designs: [], previewSource: null });
  vi.mocked(useLazyDesignFileTree).mockReturnValue({
    files: [],
    tree: [],
    loading: false,
    backend: 'workspace',
    loadDirectory: vi.fn(),
  });
});

afterEach(() => vi.unstubAllGlobals());

describe('empty workspace layout', () => {
  it('keeps workspace controls and one guided preview without reserving a blank file tree', () => {
    const html = renderToStaticMarkup(<FilesTabView />);
    expect(html).toContain('codesign-empty-workspace');
    expect(html.match(/No files yet/g)).toHaveLength(1);
    expect(html).toContain('Describe your design in the chat');
    expect(html).toContain('Choose');
    expect(html).not.toContain('role="separator"');
    expect(html).not.toContain('<aside');
  });

  it('shows loading rather than a resolved empty instruction during initial discovery', () => {
    vi.mocked(useLazyDesignFileTree).mockReturnValue({
      files: [],
      tree: [],
      loading: true,
      backend: 'workspace',
      loadDirectory: vi.fn(),
    });
    const html = renderToStaticMarkup(<FilesTabView />);
    expect(html).toContain('Loading');
    expect(html).not.toContain('No files yet');
  });

  it('retains a real file tree during background refreshes', () => {
    vi.mocked(useLazyDesignFileTree).mockReturnValue({
      files: [{ path: 'brief.md', kind: 'text', updatedAt: '2026-09-17' }],
      tree: [
        {
          name: 'brief.md',
          path: 'brief.md',
          type: 'file',
          file: { path: 'brief.md', kind: 'text', updatedAt: '2026-09-17' },
        },
      ],
      loading: true,
      backend: 'workspace',
      loadDirectory: vi.fn(),
    });
    const html = renderToStaticMarkup(<FilesTabView />);
    expect(html).toContain('title="brief.md"');
    expect(html).toContain('role="separator"');
    expect(html).not.toContain('codesign-empty-workspace');
  });
});
