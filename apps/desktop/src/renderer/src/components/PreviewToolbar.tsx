import { useT } from '@open-codesign/i18n';
import { Download, MessageSquare } from 'lucide-react';
import { type ReactElement, useEffect } from 'react';
import type { ExportFormat } from '../../../preload/index';
import { useCodesignStore } from '../store';
import { PreviewToolbarMenu } from './PreviewToolbarMenu';
import './PreviewToolbar.css';

const ZOOM_OPTIONS = [50, 75, 90, 100, 110, 125, 150, 175, 200] as const;
const EXPORT_FORMATS: ExportFormat[] = ['html', 'pdf', 'pptx', 'zip', 'markdown'];

export function PreviewToolbar(): ReactElement {
  const t = useT();
  const previewSource = useCodesignStore((s) => s.previewSource);
  const exportActive = useCodesignStore((s) => s.exportActive);
  const toastMessage = useCodesignStore((s) => s.toastMessage);
  const dismissToast = useCodesignStore((s) => s.dismissToast);
  const previewZoom = useCodesignStore((s) => s.previewZoom);
  const previewZoomMode = useCodesignStore((s) => s.previewZoomMode);
  const setPreviewZoom = useCodesignStore((s) => s.setPreviewZoom);
  const setPreviewZoomMode = useCodesignStore((s) => s.setPreviewZoomMode);
  const interactionMode = useCodesignStore((s) => s.interactionMode);
  const setInteractionMode = useCodesignStore((s) => s.setInteractionMode);

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = setTimeout(() => dismissToast(), 4000);
    return () => clearTimeout(timeout);
  }, [toastMessage, dismissToast]);

  const disabled = !previewSource;
  const commentActive = interactionMode === 'comment';

  return (
    <div className="codesign-preview-toolbar">
      {toastMessage && (
        <output className="min-w-0 basis-full max-h-[var(--size-control-lg)] overflow-auto text-[var(--text-xs)] text-[var(--color-text-secondary)] [overflow-wrap:anywhere]">
          {toastMessage}
        </output>
      )}
      <button
        type="button"
        disabled={disabled}
        aria-pressed={commentActive}
        onClick={() => setInteractionMode(commentActive ? 'default' : 'comment')}
        className="codesign-preview-control"
      >
        <MessageSquare className="w-[var(--size-icon-md)] h-[var(--size-icon-md)]" aria-hidden />
        {t('preview.commentMode')}
      </button>
      <PreviewToolbarMenu
        label={t('preview.zoom')}
        disabled={disabled}
        compact
        items={[
          {
            id: 'fit',
            label: t('preview.zoomFit'),
            checked: previewZoomMode === 'fit',
            onSelect: () => setPreviewZoomMode('fit'),
          },
          ...ZOOM_OPTIONS.map((value) => ({
            id: String(value),
            label: `${value}%`,
            checked: previewZoomMode === 'manual' && previewZoom === value,
            onSelect: () => setPreviewZoom(value),
          })),
        ]}
      >
        <span className="tabular-nums">
          {previewZoomMode === 'fit'
            ? `${t('preview.zoomFit')} ${previewZoom}%`
            : `${previewZoom}%`}
        </span>
      </PreviewToolbarMenu>
      <PreviewToolbarMenu
        label={t('export.button')}
        disabled={disabled}
        items={EXPORT_FORMATS.map((format) => ({
          id: format,
          label: t(`export.items.${format}.label`),
          hint: t(`export.items.${format}.hint`),
          onSelect: () => void exportActive(format),
        }))}
      >
        <Download className="w-[var(--size-icon-md)] h-[var(--size-icon-md)]" aria-hidden />
        {t('export.button')}
      </PreviewToolbarMenu>
    </div>
  );
}
