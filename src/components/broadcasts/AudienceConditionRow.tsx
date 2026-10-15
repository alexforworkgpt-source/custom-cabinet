import { useTranslation } from 'react-i18next';
import type { BroadcastAudienceCondition } from '../../api/adminBroadcasts';
import { DateField } from '../DateField';
import { Button } from '../primitives/Button';
import { AudienceUserLookup } from './AudienceUserLookup';
import type { FieldChoice, UserField } from './audience';

interface Props {
  condition: BroadcastAudienceCondition;
  index: number;
  choices: FieldChoice[];
  canRemove: boolean;
  onChange: (update: Partial<BroadcastAudienceCondition>) => void;
  onRemove: () => void;
}

export function AudienceConditionRow({
  condition,
  index,
  choices,
  canRemove,
  onChange,
  onRemove,
}: Props) {
  const { t } = useTranslation();
  const choice = choices.find((item) => item.field === condition.field);
  return (
    <div key={condition.client_id || index}>
      {index > 0 && (
        <select
          aria-label={t('admin.broadcasts.audience.join', 'Связь условий')}
          value={condition.join || 'and'}
          onChange={(event) => onChange({ join: event.target.value as 'and' | 'or' })}
          className="input mb-2 w-24"
        >
          <option value="and">{t('admin.broadcasts.audience.and', 'И')}</option>
          <option value="or">{t('admin.broadcasts.audience.or', 'ИЛИ')}</option>
        </select>
      )}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_140px_minmax(0,2fr)_auto]">
        <select
          aria-label={t('admin.broadcasts.audience.field', 'Условие фильтрации')}
          value={condition.field}
          onChange={(event) => {
            const next = choices.find((item) => item.field === event.target.value);
            onChange({
              field: event.target.value,
              operator: next?.kind === 'date' ? 'before' : 'eq',
              value: next?.kind === 'fixed' ? next.values?.[0]?.value || '' : '',
              value_to: null,
              label: null,
            });
          }}
          className="input min-w-0"
        >
          <option value="">{t('admin.broadcasts.audience.field', 'Условие фильтрации')}</option>
          {choices.map((item) => (
            <option key={item.field} value={item.field}>
              {item.label}
            </option>
          ))}
        </select>
        {choice?.kind === 'date' ? (
          <select
            aria-label={t('admin.broadcasts.audience.comparison', 'Оператор сравнения')}
            value={condition.operator}
            onChange={(event) =>
              onChange({
                operator: event.target.value as 'before' | 'after' | 'between',
                value_to: null,
              })
            }
            className="input min-w-0"
          >
            <option value="before">{t('admin.broadcasts.atomic.before', 'До даты')}</option>
            <option value="after">{t('admin.broadcasts.atomic.after', 'После даты')}</option>
            <option value="between">{t('admin.broadcasts.atomic.between', 'Между датами')}</option>
          </select>
        ) : choice?.kind === 'number' || choice?.kind === 'fixed' ? (
          <span className="flex items-center justify-center text-center text-sm text-dark-400">
            {choice.kind === 'number' ? (condition.field === 'traffic_gt' ? '>' : '<') : '='}
          </span>
        ) : (
          <select
            aria-label={t('admin.broadcasts.audience.comparison', 'Оператор сравнения')}
            value={condition.operator}
            onChange={(event) => onChange({ operator: event.target.value as 'eq' | 'ne' })}
            className="input min-w-0"
          >
            <option value="eq">{t('admin.broadcasts.audience.equals', 'Равно')}</option>
            <option value="ne">{t('admin.broadcasts.audience.notEquals', 'Не равно')}</option>
          </select>
        )}
        {choice?.kind === 'date' ? (
          <div
            className={`grid min-w-0 gap-2 ${condition.operator === 'between' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}
          >
            <DateField
              value={condition.value}
              onChange={(value) => onChange({ value })}
              max={condition.operator === 'between' ? condition.value_to || undefined : undefined}
              placeholder={t('admin.broadcasts.atomic.dateFrom', 'Дата')}
              className="input flex min-w-0 items-center gap-2 whitespace-nowrap text-left"
            />
            {condition.operator === 'between' && (
              <DateField
                value={condition.value_to || ''}
                onChange={(value) => onChange({ value_to: value })}
                min={condition.value || undefined}
                placeholder={t('admin.broadcasts.atomic.dateTo', 'До')}
                className="input flex min-w-0 items-center gap-2 whitespace-nowrap text-left"
              />
            )}
          </div>
        ) : choice?.kind === 'number' ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="1000000"
              step="any"
              inputMode="decimal"
              placeholder="0"
              className="input w-full min-w-0"
              value={condition.value}
              onChange={(event) => onChange({ value: event.target.value })}
              aria-label={t('admin.broadcasts.atomic.gigabytes', 'Гигабайты')}
            />
            <span className="text-sm text-dark-400">{t('common.units.gb', 'ГБ')}</span>
          </div>
        ) : choice?.kind === 'user' ? (
          <AudienceUserLookup
            key={`${index}-${condition.field}`}
            field={condition.field as UserField}
            condition={condition}
            rowIndex={index}
            onSelect={(value, label) => onChange({ value, label })}
          />
        ) : choice?.kind === 'fixed' ? (
          <span className="flex items-center text-sm text-dark-200">
            {choice.values?.[0]?.label}
          </span>
        ) : (
          <select
            aria-label={t('admin.broadcasts.audience.value', 'Значение')}
            value={condition.value}
            onChange={(event) => onChange({ value: event.target.value })}
            disabled={!condition.field}
            className="input min-w-0"
          >
            <option value="">{t('admin.broadcasts.audience.value', 'Значение')}</option>
            {(choice?.values || []).map((value) => (
              <option key={value.value} value={value.value}>
                {value.label}
              </option>
            ))}
          </select>
        )}
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={() => onRemove()}
          disabled={!canRemove}
          aria-label={t('admin.broadcasts.audience.remove', 'Удалить условие')}
          className="h-10 w-10 justify-self-end rounded-lg border border-dark-700 text-dark-300 hover:border-dark-500 disabled:opacity-40"
        >
          ×
        </Button>
      </div>
    </div>
  );
}
