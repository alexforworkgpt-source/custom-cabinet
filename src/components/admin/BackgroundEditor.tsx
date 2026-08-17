import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { brandingApi } from '@/api/branding';
import { setCachedAnimationConfig } from '@/utils/backgroundConfig';
import type { AnimationConfig } from '@/components/ui/backgrounds/types';
import { BackgroundConfigEditor } from './BackgroundConfigEditor';
import { cn } from '@/lib/utils';

export function BackgroundEditor() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const {
    data: serverConfig,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['animation-config'],
    queryFn: brandingApi.getAnimationConfig,
    staleTime: 30_000,
  });

  const [localConfig, setLocalConfig] = useState<AnimationConfig | null>(null);
  const config = localConfig ?? serverConfig;

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const saveMutation = useMutation({
    mutationFn: brandingApi.updateAnimationConfig,
    onMutate: () => setSaveStatus('saving'),
    onSuccess: (data) => {
      setCachedAnimationConfig(data);
      queryClient.setQueryData(['animation-config'], data);
      queryClient.setQueryData(['animation-config-runtime'], data);
      setLocalConfig(null);
      setSaveStatus('saved');
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
    },
    onError: () => setSaveStatus('idle'),
  });

  const handleChange = useCallback((newConfig: AnimationConfig) => {
    setLocalConfig(newConfig);
  }, []);

  const handleSave = () => {
    if (!config) return;
    saveMutation.mutate(config);
  };

  const isDirty = localConfig !== null;
  const showSaveButton = isDirty || saveStatus === 'saved' || saveStatus === 'saving';

  if (isPending) {
    return <div className="py-8 text-center text-sm text-dark-400">{t('common.loading')}</div>;
  }

  if (isError || !config) {
    return (
      <div className="rounded-xl border border-error-500/30 bg-error-500/10 p-4" role="alert">
        <p className="text-sm text-error-400">{t('admin.backgrounds.loadError')}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-3 min-h-11 rounded-xl bg-dark-700 px-4 text-sm font-medium text-dark-100 transition-colors hover:bg-dark-600"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackgroundConfigEditor value={config} onChange={handleChange} />

      {/* Save button */}
      {showSaveButton && (
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending || saveStatus === 'saved'}
          className={cn(
            'w-full rounded-xl py-3 text-sm font-medium transition-colors',
            saveStatus === 'saved'
              ? 'bg-success-500/20 text-success-400'
              : 'bg-accent-500 text-on-accent hover:bg-accent-600 disabled:opacity-50',
          )}
        >
          {saveStatus === 'saving'
            ? t('admin.backgrounds.saving')
            : saveStatus === 'saved'
              ? t('admin.backgrounds.saved')
              : t('admin.backgrounds.save')}
        </button>
      )}

      {saveMutation.isError && (
        <p className="text-sm text-error-400" role="alert">
          {t('admin.backgrounds.saveError')}
        </p>
      )}
    </div>
  );
}
