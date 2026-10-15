import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  adminBroadcastsApi,
  type BroadcastAudience,
  type BroadcastAudienceCondition,
} from '../../api/adminBroadcasts';
import { usePermissionStore } from '../../store/permissions';
import { Button } from '../primitives/Button';
import { AudienceConditionRow } from './AudienceConditionRow';
import { AudienceRecipientsPreview } from './AudienceRecipientsPreview';
import { buildAudienceFields } from './audienceFields';
import { isAudienceComplete, rowId, type Channel, type Category, type Filter } from './audience';

export { emptyAudience, isAudienceComplete } from './audience';

interface Props {
  channel: Channel;
  category: Category;
  audience: BroadcastAudience;
  onChange: (audience: BroadcastAudience) => void;
  filters: Filter[];
  isLoading: boolean;
}

export function BroadcastAudienceEditor({
  channel,
  category,
  audience,
  onChange,
  filters,
  isLoading,
}: Props) {
  const { t } = useTranslation();
  const canSeeUsers = usePermissionStore((state) => state.hasPermission('users:read'));
  const [showUsers, setShowUsers] = useState(false);
  const [offset, setOffset] = useState(0);
  const trigger = useRef<HTMLButtonElement>(null);
  const pageSize = 50;
  const choices = buildAudienceFields(t, channel, filters);
  const valid = isAudienceComplete(audience);
  const preview = useQuery({
    queryKey: ['admin', 'broadcasts', 'audience', channel, category, audience, offset],
    queryFn: () =>
      adminBroadcastsApi.previewAudience({ channel, category, audience, offset, limit: pageSize }),
    enabled: valid && !isLoading,
  });

  const changeCondition = (index: number, update: Partial<BroadcastAudienceCondition>) => {
    setOffset(0);
    onChange({
      conditions: audience.conditions.map((condition, position) =>
        position === index ? { ...condition, ...update } : condition,
      ),
    });
  };
  const removeCondition = (index: number) => {
    setOffset(0);
    onChange({
      conditions: audience.conditions
        .filter((_, position) => position !== index)
        .map((condition, position) => (position === 0 ? { ...condition, join: null } : condition)),
    });
  };
  const addCondition = () => {
    setOffset(0);
    onChange({
      conditions: [
        ...audience.conditions,
        { client_id: rowId(), field: '', operator: 'eq', value: '', join: 'and' },
      ],
    });
  };

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-dark-300">
        {t('admin.broadcasts.selectFilter', 'Выберите аудиторию')}
      </h3>
      <div className="space-y-3">
        {audience.conditions.map((condition, index) => (
          <AudienceConditionRow
            key={condition.client_id || index}
            condition={condition}
            index={index}
            choices={choices}
            canRemove={audience.conditions.length > 1}
            onChange={(update) => changeCondition(index, update)}
            onRemove={() => removeCondition(index)}
          />
        ))}
      </div>
      <Button variant="ghost" className="mt-3" onClick={addCondition}>
        + {t('admin.broadcasts.audience.add', 'Добавить условие')}
      </Button>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-dark-300">
        {valid && preview.isPending && <span>{t('common.loading', 'Загрузка...')}</span>}
        {valid && preview.isError && (
          <span role="alert" className="text-error-400">
            {t('admin.broadcasts.audience.loadError', 'Не удалось загрузить получателей')}
          </span>
        )}
        {valid && preview.data && (
          <>
            <span>
              {t('admin.broadcasts.audience.recipientCount', 'Получателей')}:{' '}
              <strong className="text-accent-400">{preview.data.count}</strong>
            </span>
            {canSeeUsers && (
              <Button
                ref={trigger}
                variant="ghost"
                onClick={() => {
                  setOffset(0);
                  setShowUsers(true);
                  void preview.refetch();
                }}
              >
                {t('admin.broadcasts.audience.showUsers', 'Посмотреть список')}
              </Button>
            )}
          </>
        )}
      </div>
      {canSeeUsers && (
        <AudienceRecipientsPreview
          open={showUsers}
          onOpenChange={setShowUsers}
          restoreFocusTo={trigger.current}
          channel={channel}
          data={preview.data}
          isPending={preview.isPending}
          isError={preview.isError}
          offset={offset}
          pageSize={pageSize}
          onOffsetChange={setOffset}
        />
      )}
    </div>
  );
}
