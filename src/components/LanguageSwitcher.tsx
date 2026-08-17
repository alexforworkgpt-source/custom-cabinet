import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { infoApi } from '@/api/info';
import { ChevronDownIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  variant?: 'default' | 'profile';
}

export default function LanguageSwitcher({ variant = 'default' }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Кэш react-query переживает перемонтирование AppShell при смене роута:
  // локальный useState начинал каждый маунт с пустого списка, и до ответа API
  // компонент рендерил null — переключатель «мигал» при каждой навигации.
  const { data } = useQuery({
    queryKey: ['languages'],
    queryFn: infoApi.getLanguages,
    staleTime: 1000 * 60 * 5,
  });
  const availableLanguages = data?.languages ?? [];

  const currentLang = availableLanguages.find((l) => l.code === i18n.language) ||
    availableLanguages[0] || { code: 'ru', name: 'RU', flag: '🇷🇺' };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (code: string) => {
    // i18n.ts subscribes to languageChanged and syncs <html lang> + dir
    // centrally — no need to set documentElement.dir here.
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  if (availableLanguages.length <= 1) {
    return null;
  }

  return (
    <div data-language-switcher className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 rounded-xl border text-sm transition-all',
          variant === 'profile' ? 'h-11 min-w-24 justify-center px-3' : 'px-2.5 py-2',
          isOpen
            ? 'border-dark-600 bg-dark-700'
            : variant === 'profile'
              ? 'border-dark-700/70 bg-dark-900/80 hover:border-dark-600 hover:bg-dark-800'
              : 'border-dark-700/50 bg-dark-800/50 hover:border-dark-600 hover:bg-dark-700',
        )}
        aria-label={t('profile.hub.changeLanguage')}
        aria-expanded={isOpen}
      >
        <span>{currentLang.flag}</span>
        <span className="font-medium text-dark-200">{currentLang.code.toUpperCase()}</span>
        <ChevronDownIcon
          className={`h-3.5 w-3.5 text-dark-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          data-language-menu
          className="absolute end-0 z-50 mt-2 w-40 animate-fade-in rounded-xl border border-dark-700/50 bg-dark-800 py-1 shadow-lg"
        >
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                lang.code === i18n.language
                  ? 'bg-accent-500/10 text-accent-400'
                  : 'text-dark-300 hover:bg-dark-700/50'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
