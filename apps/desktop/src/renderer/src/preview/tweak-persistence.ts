import {
  DEFAULT_SOURCE_ENTRY,
  type EditmodeTokens,
  LEGACY_SOURCE_ENTRY,
  parseEditmodeBlock,
  parseTweakSchema,
  replaceEditmodeBlock,
} from '@open-codesign/shared';
import {
  resolveWorkspacePreviewSource,
  type WorkspacePreviewRead,
  type WorkspacePreviewReadResult,
} from './workspace-source';

export type WorkspacePreviewWrite = (
  designId: string,
  path: string,
  content: string,
  options?: { expectedContent: string },
) => Promise<WorkspacePreviewReadResult>;

export interface PersistTweakTokensResult {
  content: string;
  path: string;
  wrote: boolean;
}

export function createTweakPersistDebounce() {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let baseSource: string | null = null;
  return {
    hasPending: () => timer !== null,
    cancel() {
      if (timer !== null) clearTimeout(timer);
      timer = null;
      baseSource = null;
    },
    schedule(
      source: string,
      tokens: EditmodeTokens,
      persist: (source: string, tokens: EditmodeTokens) => void,
    ) {
      if (timer !== null) clearTimeout(timer);
      // A watcher may refresh source while the user is still typing.
      const originalSource = baseSource ?? source;
      baseSource = originalSource;
      timer = setTimeout(() => {
        timer = null;
        baseSource = null;
        persist(originalSource, tokens);
      }, 400);
    },
  };
}

export async function resolveTweakWriteTarget(input: {
  designId: string;
  previewSource: string;
  path?: string | undefined;
  read?: WorkspacePreviewRead | undefined;
}): Promise<WorkspacePreviewReadResult> {
  if (!input.read)
    return { content: input.previewSource, path: input.path ?? DEFAULT_SOURCE_ENTRY };
  if (input.path) return input.read(input.designId, input.path);
  let index: WorkspacePreviewReadResult;
  try {
    index = await input.read(input.designId, DEFAULT_SOURCE_ENTRY);
  } catch {
    index = await input.read(input.designId, LEGACY_SOURCE_ENTRY);
  }
  return await resolveWorkspacePreviewSource({
    designId: input.designId,
    source: index.content,
    path: index.path,
    read: input.read,
  });
}

export function mergeTweakTokenChanges(
  source: string,
  baseSource: string,
  tokens: EditmodeTokens,
): string {
  const base = parseEditmodeBlock(baseSource);
  const current = parseEditmodeBlock(source);
  if (!base || !current) throw new Error('Tweak source no longer contains an EDITMODE block.');
  const schema = parseTweakSchema(source);
  const merged = { ...current.tokens };
  for (const [key, value] of Object.entries(tokens)) {
    if (value === base.tokens[key]) continue;
    if (
      !Object.hasOwn(base.tokens, key) ||
      !Object.hasOwn(current.tokens, key) ||
      (current.tokens[key] !== base.tokens[key] && current.tokens[key] !== value)
    ) {
      throw new Error(`Tweak "${key}" changed in the source. Reload its controls before editing.`);
    }
    if (typeof value !== typeof current.tokens[key]) {
      throw new Error(`Tweak "${key}" has an incompatible value type.`);
    }
    const entry = schema?.[key];
    if (
      typeof value === 'number' &&
      (!Number.isFinite(value) ||
        (entry?.kind === 'number' && (value < (entry.min ?? 0) || value > (entry.max ?? 100))))
    ) {
      throw new Error(`Tweak "${key}" is outside its supported range.`);
    }
    if (entry?.kind === 'enum' && !entry.options.includes(String(value))) {
      throw new Error(`Tweak "${key}" is not a supported option.`);
    }
    merged[key] = value;
  }
  return replaceEditmodeBlock(source, merged);
}

export async function persistTweakTokensToWorkspace(input: {
  designId: string | null;
  previewSource: string;
  path?: string | undefined;
  tokens: EditmodeTokens;
  read?: WorkspacePreviewRead | undefined;
  write?: WorkspacePreviewWrite | undefined;
  canWrite?: (() => boolean) | undefined;
}): Promise<PersistTweakTokensResult> {
  const assertWritable = () => {
    if (input.canWrite && !input.canWrite()) {
      throw new Error('Tweak save cancelled because the active design or generation changed.');
    }
  };
  assertWritable();
  const fallbackContent = mergeTweakTokenChanges(
    input.previewSource,
    input.previewSource,
    input.tokens,
  );
  if (!input.designId || !input.write) {
    return { content: fallbackContent, path: input.path ?? DEFAULT_SOURCE_ENTRY, wrote: false };
  }

  const target = await resolveTweakWriteTarget({
    designId: input.designId,
    previewSource: input.previewSource,
    path: input.path,
    read: input.read,
  });
  const nextContent = mergeTweakTokenChanges(target.content, input.previewSource, input.tokens);
  assertWritable();
  await input.write(input.designId, target.path, nextContent, { expectedContent: target.content });
  return { content: nextContent, path: target.path, wrote: true };
}
