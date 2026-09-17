import { initI18n } from '@open-codesign/i18n';
import type { ActiveRunMessageInputV1, ActiveRunMessageV1 } from '@open-codesign/shared';
import '@open-codesign/ui/tokens.css';
import { createRoot } from 'react-dom/client';
import type { CodesignApi } from '../../../../../preload';
import { useCodesignStore } from '../../../store';
import { PromptInput } from '../PromptInput';

const calls: ActiveRunMessageInputV1[] = [];
const pending = new Map<
  string,
  {
    resolve: (message: ActiveRunMessageV1) => void;
    reject: (error: Error) => void;
  }
>();
const rows = new Map<string, ActiveRunMessageV1>();
let generateCalls = 0;
let cancelCalls = 0;
const get = useCodesignStore.getState;

window.codesign = {
  sendActiveMessage(input: ActiveRunMessageInputV1) {
    calls.push(input);
    return new Promise<ActiveRunMessageV1>((resolve, reject) => {
      pending.set(input.messageId, { resolve, reject });
    });
  },
  async listActiveMessages(designId: string) {
    return [...rows.values()].filter((row) => row.designId === designId);
  },
  async cancelGeneration() {
    cancelCalls++;
    for (const [id, row] of rows) {
      if (row.status === 'pending')
        rows.set(id, { ...row, status: 'not-delivered', reason: 'Stopped' });
    }
  },
  async generate() {
    generateCalls++;
    throw new Error('Unexpected generation in the isolated component fixture');
  },
} as unknown as CodesignApi;

await initI18n('en');
useCodesignStore.setState({
  currentDesignId: 'browser-design',
  isGenerating: true,
  activeGenerationId: 'browser-run',
  generatingDesignId: 'browser-design',
  generationStage: 'thinking',
  generationByDesign: {
    'browser-design': { generationId: 'browser-run', stage: 'thinking', awaitingResponse: true },
  },
});

window.activeMessageFixture = {
  snapshot() {
    return {
      calls,
      generateCalls,
      cancelCalls,
      draft: get().composerDrafts['browser-design'] ?? '',
      rows: get().activeMessagesByDesign['browser-design'] ?? [],
      toasts: get().toasts.map((toast) => ({ title: toast.title, description: toast.description })),
      files: get().inputFiles,
      comments: get().queuedCommentIds,
    };
  },
  accept(index) {
    const input = calls[index];
    if (!input) throw new Error('Missing submission');
    const message: ActiveRunMessageV1 = {
      ...input,
      status: 'pending',
      createdAt: '2026-09-17T00:00:00Z',
    };
    rows.set(input.messageId, message);
    pending.get(input.messageId)?.resolve(message);
    pending.delete(input.messageId);
  },
  reject(index) {
    const input = calls[index];
    if (!input) throw new Error('Missing submission');
    pending.get(input.messageId)?.reject(new Error('Fake gate: generation not ready'));
    pending.delete(input.messageId);
  },
  settleUndelivered(index, eventBeforeAck) {
    const input = calls[index];
    if (!input) throw new Error('Missing submission');
    const message: ActiveRunMessageV1 = {
      ...input,
      status: 'not-delivered',
      createdAt: '2026-09-17T00:00:00Z',
      reason: 'Fake gate: stopped before delivery',
    };
    rows.set(input.messageId, message);
    if (eventBeforeAck) get().reconcileActiveMessage(message);
    pending
      .get(input.messageId)
      ?.resolve(eventBeforeAck ? { ...message, status: 'pending' } : message);
    pending.delete(input.messageId);
  },
  setContext(kind) {
    useCodesignStore.setState({
      inputFiles: kind === 'file' ? [{ name: 'brief.md', path: 'brief.md', size: 12 }] : [],
      queuedCommentIds: kind === 'comment' ? ['pending-comment'] : [],
      referenceUrl: kind === 'url' ? 'https://example.invalid/reference' : '',
    });
  },
};

export interface ActiveMessageBrowserFixture {
  snapshot: () => {
    calls: ActiveRunMessageInputV1[];
    generateCalls: number;
    cancelCalls: number;
    draft: string;
    rows: ActiveRunMessageV1[];
    toasts: Array<{ title: string; description?: string | undefined }>;
    files: Array<{ name: string; path: string; size: number }>;
    comments: string[];
  };
  accept: (index: number) => void;
  reject: (index: number) => void;
  settleUndelivered: (index: number, eventBeforeAck: boolean) => void;
  setContext: (kind: 'file' | 'comment' | 'url' | null) => void;
}
declare global {
  interface Window {
    activeMessageFixture: ActiveMessageBrowserFixture;
  }
}

function Fixture() {
  const isGenerating = useCodesignStore((state) => state.isGenerating);
  const toasts = useCodesignStore((state) => state.toasts);
  return (
    <aside style={{ width: 420, height: 800 }}>
      <div className="codesign-sidebar-composer">
        <PromptInput
          isGenerating={isGenerating}
          onSubmit={(prompt) => {
            void get().sendPrompt({ prompt });
          }}
          onActiveSubmit={get().sendActiveMessage}
          onCancel={get().cancelGeneration}
        />
      </div>
      <output>{toasts.map((toast) => toast.description).join('\n')}</output>
    </aside>
  );
}
const root = document.getElementById('root');
if (!root) throw new Error('Fixture root missing');
createRoot(root).render(<Fixture />);
