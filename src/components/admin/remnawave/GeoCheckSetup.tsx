import { useTranslation } from 'react-i18next';
import { GlobeIcon, NetworkIcon, SparklesIcon } from '@/components/icons';
import { Button } from '@/components/primitives/Button';
import { cn } from '@/lib/utils';
import { isRouteReady, type GeoCheckRouteMode } from './geoCheckRoute';

interface GeoCheckSetupProps {
  mode: GeoCheckRouteMode;
  value: string;
  suggestions: string[];
  onModeChange: (mode: GeoCheckRouteMode) => void;
  onValueChange: (value: string) => void;
}

export function GeoCheckSetup({
  mode,
  value,
  suggestions,
  onModeChange,
  onValueChange,
}: GeoCheckSetupProps) {
  const { t } = useTranslation();

  const modes: Array<{ id: GeoCheckRouteMode; label: string }> = [
    { id: 'default', label: t('admin.remnawave.geoCheck.mode.default', 'Default') },
    { id: 'ip', label: t('admin.remnawave.geoCheck.mode.ip', 'IP address') },
    { id: 'interface', label: t('admin.remnawave.geoCheck.mode.interface', 'Interface') },
  ];

  const hint =
    mode === 'default'
      ? t('admin.remnawave.geoCheck.hint.default', 'The node will use its default outbound route.')
      : mode === 'ip'
        ? t(
            'admin.remnawave.geoCheck.hint.ip',
            'Pick one of the node addresses or type any address.',
          )
        : t(
            'admin.remnawave.geoCheck.hint.interface',
            'Pick one of the node interfaces or type any name.',
          );
  const placeholder =
    mode === 'default'
      ? t('admin.remnawave.geoCheck.placeholder.default', 'Automatic')
      : mode === 'ip'
        ? '1.2.3.4'
        : 'eth0';
  const isInvalid = mode !== 'default' && value.trim().length > 0 && !isRouteReady(mode, value);

  return (
    <div className="space-y-4">
      <div
        role="group"
        aria-label={t('admin.remnawave.geoCheck.mode.legend', 'Check route')}
        className="flex gap-1 rounded-xl bg-dark-800/50 p-1"
      >
        {modes.map((item) => (
          <Button
            key={item.id}
            type="button"
            variant="ghost"
            size="lg"
            aria-pressed={mode === item.id}
            onClick={() => onModeChange(item.id)}
            className={cn(
              'min-w-0 flex-1 whitespace-nowrap px-2 text-xs sm:px-3 sm:text-sm',
              mode === item.id
                ? 'bg-accent-500/20 text-accent-400'
                : 'text-dark-400 hover:bg-dark-700/50 hover:text-dark-200',
            )}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div>
        <label htmlFor="geocheck-route-value" className="block text-sm font-medium text-dark-200">
          {modes.find((item) => item.id === mode)?.label}
        </label>
        <p id="geocheck-route-hint" className="mt-0.5 text-xs text-dark-400">
          {hint}
        </p>

        <div className="relative mt-2">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dark-500">
            {mode === 'default' ? (
              <SparklesIcon className="h-4 w-4" />
            ) : mode === 'ip' ? (
              <GlobeIcon className="h-4 w-4" />
            ) : (
              <NetworkIcon className="h-4 w-4" />
            )}
          </span>
          <input
            id="geocheck-route-value"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            disabled={mode === 'default'}
            value={mode === 'default' ? '' : value}
            onChange={(event) => onValueChange(event.target.value)}
            placeholder={placeholder}
            aria-invalid={isInvalid}
            aria-describedby={
              isInvalid ? 'geocheck-route-hint geocheck-route-error' : 'geocheck-route-hint'
            }
            className={cn(
              'input pl-9 font-mono disabled:cursor-not-allowed disabled:opacity-60',
              isInvalid && 'input-error',
            )}
          />
        </div>

        {isInvalid && (
          <p id="geocheck-route-error" className="mt-1.5 text-xs text-error-400">
            {mode === 'ip'
              ? t('admin.remnawave.geoCheck.invalidIp', 'Enter a valid IPv4 or IPv6 address')
              : t('admin.remnawave.geoCheck.invalidInterface', 'Enter a valid interface name')}
          </p>
        )}

        {suggestions.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => onValueChange(suggestion)}
                className={cn(
                  'min-w-11 max-w-full truncate px-2 font-mono text-[11px]',
                  value.trim() === suggestion
                    ? 'bg-accent-500/20 text-accent-300'
                    : 'bg-dark-700/60 text-dark-300 hover:bg-dark-700 hover:text-dark-100',
                )}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
