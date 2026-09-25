import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { EmailIcon } from '@/components/icons';
import { usePermissionStore } from '@/store/permissions';

interface EmailBroadcastActionProps {
  userId: number;
  email: string | null;
  emailVerified: boolean;
}

export function EmailBroadcastAction({ userId, email, emailVerified }: EmailBroadcastActionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const canSendBroadcasts = usePermissionStore((state) => state.hasPermission('broadcasts:send'));

  if (!canSendBroadcasts || !email || !emailVerified) return null;

  const label = t('admin.users.detail.header.writeEmail');
  return (
    <button
      type="button"
      onClick={() =>
        navigate(`/admin/broadcasts/create?email_user=${userId}`, {
          state: { emailUserLabel: email },
        })
      }
      aria-label={label}
      title={label}
      className="btn-secondary flex h-10 items-center gap-2 px-3"
    >
      <EmailIcon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
