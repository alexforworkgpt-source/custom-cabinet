import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { renderTelegramHtml } from './telegramHtml';

interface PreviewButton {
  text: string;
  url?: string;
  callback_data?: string;
}

interface TelegramPreviewProps {
  open: boolean;
  onClose: () => void;
  text: string;
  mediaUrl?: string | null;
  mediaType?: 'photo' | 'video' | null;
  buttons?: PreviewButton[][];
}

interface EmailPreviewProps {
  open: boolean;
  onClose: () => void;
  subject: string;
  htmlContent: string;
}

export function TelegramPreview({
  open,
  onClose,
  text,
  mediaUrl,
  mediaType,
  buttons,
}: TelegramPreviewProps) {
  const { t } = useTranslation();
  const rendered = useMemo(() => renderTelegramHtml(text), [text]);
  const dialogRef = useFocusTrap<HTMLDivElement>(open, { onEscape: onClose });
  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-dark-950/70 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('admin.broadcasts.preview', 'Предпросмотр Telegram')}
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl bg-[#17212b] p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">
            {t('admin.broadcasts.preview', 'Предпросмотр Telegram')}
          </h3>
          <button
            onClick={onClose}
            aria-label={t('common.close', 'Закрыть')}
            className="flex h-9 w-9 items-center justify-center rounded text-dark-400 hover:bg-dark-700"
          >
            ✕
          </button>
        </div>
        <div className="rounded-xl bg-[#0e1621] p-3">
          <div className="ml-auto max-w-[90%] rounded-2xl rounded-tr-md bg-[#2b5278] p-3 text-white shadow">
            {mediaUrl && mediaType === 'photo' && (
              <img
                src={mediaUrl}
                alt=""
                loading="lazy"
                className="mb-2 max-h-72 w-full rounded-lg object-cover"
              />
            )}
            {mediaUrl && mediaType === 'video' && (
              <video src={mediaUrl} controls className="mb-2 max-h-72 w-full rounded-lg" />
            )}
            {text ? (
              <div className="whitespace-pre-wrap break-words text-[15px] leading-snug">
                {rendered}
              </div>
            ) : (
              <div className="text-sm italic text-white/60">
                {t('admin.broadcasts.previewEmpty', '— пусто —')}
              </div>
            )}
          </div>
          {buttons && buttons.length > 0 && (
            <div className="mt-2 space-y-1">
              {buttons.map((row, ri) => (
                <div key={ri} className="flex gap-1">
                  {row.map((b, ci) => (
                    <button
                      key={ci}
                      type="button"
                      className="flex-1 rounded-md bg-[#1f2c3a] px-3 py-2 text-sm text-blue-300 hover:bg-[#26384a]"
                    >
                      {b.text}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function EmailPreview({ open, onClose, subject, htmlContent }: EmailPreviewProps) {
  const { t } = useTranslation();
  const dialogRef = useFocusTrap<HTMLDivElement>(open, { onEscape: onClose });
  if (!open) return null;
  const emptyHtml = `<p style="color:#999;font-family:sans-serif">${t('admin.broadcasts.previewEmpty', '— пусто —')}</p>`;
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-dark-950/70 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={subject || t('admin.broadcasts.emailSubject', 'Email')}
        tabIndex={-1}
        className="flex h-[80vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wider text-gray-400">
              {t('admin.broadcasts.emailSubject', 'Тема')}
            </div>
            <div className="truncate text-base font-semibold text-gray-900">
              {subject || t('admin.broadcasts.previewEmpty', '— пусто —')}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('common.close', 'Закрыть')}
            className="ml-3 flex h-9 w-9 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <iframe
          title="email preview"
          className="w-full flex-1 bg-white"
          sandbox=""
          srcDoc={htmlContent || emptyHtml}
        />
      </div>
    </div>,
    document.body,
  );
}
