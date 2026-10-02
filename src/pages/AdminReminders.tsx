import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { adminRemindersApi, type ReminderResponse } from '@/api/adminReminders';
import { AdminBackButton } from '@/components/admin';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { EditIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { useNativeDialog } from '@/platform/hooks/useNativeDialog';

export default function AdminReminders() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dialog = useNativeDialog();
  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-reminders'],
    queryFn: adminRemindersApi.list,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin-reminders'] });
  const toggle = useMutation({ mutationFn: adminRemindersApi.toggle, onSuccess: refresh });
  const remove = useMutation({ mutationFn: adminRemindersApi.remove, onSuccess: refresh });

  const confirmRemove = async (reminder: ReminderResponse) => {
    if (await dialog.confirm(t('admin.reminders.confirmDelete', { name: reminder.name }))) {
      remove.mutate(reminder.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AdminBackButton />
          <h1 className="text-xl font-bold text-dark-50">{t('admin.reminders.title')}</h1>
        </div>
        <PermissionGate permission="user_reminders:create">
          <button
            type="button"
            onClick={() => navigate('/admin/reminders/create')}
            className="flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2 text-sm font-medium text-on-accent"
          >
            <PlusIcon /> {t('admin.reminders.create')}
          </button>
        </PermissionGate>
      </div>

      <p className="text-sm text-dark-400">{t('admin.reminders.description')}</p>
      {isLoading && <p className="text-dark-400">…</p>}
      {!isLoading && data.length === 0 && (
        <p className="text-dark-400">{t('admin.reminders.empty')}</p>
      )}

      <div className="space-y-3">
        {data.map((reminder) => (
          <div
            key={reminder.id}
            className={`rounded-xl border p-4 ${reminder.is_active ? 'border-success-500/50 bg-success-500/5' : 'border-dark-700 bg-dark-800/50'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`rounded-full px-2 py-1 ${reminder.is_active ? 'bg-success-500/20 text-success-400' : 'bg-dark-500/20 text-dark-400'}`}
                  >
                    {t(reminder.is_active ? 'admin.reminders.active' : 'admin.reminders.inactive')}
                  </span>
                  {reminder.is_builtin && (
                    <span className="rounded-full bg-accent-500/20 px-2 py-1 text-accent-400">
                      {t('admin.reminders.builtin')}
                    </span>
                  )}
                  <span className="text-dark-400">
                    {t(`admin.reminders.channels.${reminder.channels}`)}
                  </span>
                </div>
                <div className="font-medium text-dark-50">{reminder.name}</div>
                <div className="mt-1 text-xs text-dark-400">
                  {t('admin.reminders.stats', {
                    sent: reminder.stats.sent_total,
                    dismissed: reminder.stats.dismissed_total,
                    bot: reminder.stats.audience_bot ?? '—',
                    cabinet: reminder.stats.audience_cabinet ?? '—',
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <PermissionGate permission="user_reminders:edit">
                  <button
                    type="button"
                    onClick={() => toggle.mutate(reminder.id)}
                    className="rounded-lg bg-dark-700 px-3 py-1 text-xs text-dark-100"
                  >
                    {t(reminder.is_active ? 'admin.reminders.disable' : 'admin.reminders.enable')}
                  </button>
                  <button
                    type="button"
                    aria-label={t('admin.reminders.edit')}
                    onClick={() => navigate(`/admin/reminders/${reminder.id}/edit`)}
                    className="rounded-lg p-2 text-dark-300 hover:text-dark-100"
                  >
                    <EditIcon />
                  </button>
                </PermissionGate>
                {!reminder.is_builtin && (
                  <PermissionGate permission="user_reminders:delete">
                    <button
                      type="button"
                      aria-label={t('admin.reminders.delete')}
                      onClick={() => confirmRemove(reminder)}
                      className="rounded-lg p-2 text-error-400"
                    >
                      <TrashIcon />
                    </button>
                  </PermissionGate>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
