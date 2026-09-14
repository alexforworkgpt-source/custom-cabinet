// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '@/components/Toast';
import { PlatformProvider } from '@/platform/PlatformProvider';
import { usePermissionStore } from '@/store/permissions';
import type { EmailQueueState } from '@/api/adminEmailQueue';

const queueApi = vi.hoisted(() => ({
  getQueue: vi.fn(),
  clearQueue: vi.fn(),
}));

vi.mock('@/api/adminEmailQueue', async () => {
  const actual =
    await vi.importActual<typeof import('@/api/adminEmailQueue')>('@/api/adminEmailQueue');
  return { ...actual, adminEmailQueueApi: queueApi };
});

const emptyQueue: EmailQueueState = {
  pending: 0,
  sent: 0,
  dead: 0,
  smtp_configured: true,
  items: [],
};

async function renderCard() {
  const { EmailQueueCard } = await import('./EmailQueueCard');
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <PlatformProvider>
      <QueryClientProvider client={client}>
        <ToastProvider>
          <EmailQueueCard />
        </ToastProvider>
      </QueryClientProvider>
    </PlatformProvider>,
  );
}

beforeEach(() => {
  queueApi.getQueue.mockReset();
  queueApi.clearQueue.mockReset();
  queueApi.getQueue.mockResolvedValue(emptyQueue);
  usePermissionStore.setState({ permissions: [], isLoaded: true });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('EmailQueueCard permissions', () => {
  it('stays hidden and does not load data without email_templates:read', async () => {
    await renderCard();

    expect(screen.queryByText('Очередь писем')).toBeNull();
    expect(queueApi.getQueue).not.toHaveBeenCalled();
  });

  it('shows clear actions only with email_templates:edit', async () => {
    usePermissionStore.setState({
      permissions: ['email_templates:read', 'email_templates:edit'],
    });
    queueApi.getQueue.mockResolvedValueOnce({
      ...emptyQueue,
      pending: 2,
      sent: 1,
    });

    await renderCard();

    expect(await screen.findByRole('button', { name: 'Убрать ожидающие' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Очистить' })).toBeTruthy();
  });

  it('keeps the counters read-only without email_templates:edit', async () => {
    usePermissionStore.setState({ permissions: ['email_templates:read'] });
    queueApi.getQueue.mockResolvedValueOnce({ ...emptyQueue, pending: 1 });

    await renderCard();

    expect(await screen.findByRole('heading', { name: 'Очередь писем' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Убрать ожидающие' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Очистить' })).toBeNull();
  });
});

describe('EmailQueueCard states', () => {
  it('keeps the empty queue visible with honest zero counters', async () => {
    usePermissionStore.setState({ permissions: ['email_templates:read'] });

    await renderCard();

    expect(await screen.findByRole('heading', { name: 'Очередь писем' })).toBeTruthy();
    expect(screen.getAllByText('0')).toHaveLength(3);
    expect(screen.getByText('Только письма, не ушедшие с первого раза')).toBeTruthy();
  });

  it('shows populated queue details without exposing the raw delivery error', async () => {
    usePermissionStore.setState({ permissions: ['email_templates:read'] });
    queueApi.getQueue.mockResolvedValueOnce({
      pending: 1,
      sent: 0,
      dead: 1,
      smtp_configured: false,
      items: [
        {
          id: 7,
          to_email: 'user@example.com',
          subject: 'Код подтверждения',
          status: 'dead',
          attempts: 3,
          next_attempt_at: null,
          last_error: 'SMTP INTERNAL: password=secret-provider-detail',
          created_at: '2026-09-08T05:53:29Z',
          sent_at: null,
        },
      ],
    } satisfies EmailQueueState);

    const { container } = await renderCard();

    expect(await screen.findByText('user@example.com')).toBeTruthy();
    expect(screen.getByText(/Код подтверждения/)).toBeTruthy();
    expect(screen.getByText('Не доставлено')).toBeTruthy();
    expect(screen.getByText(/письма не отправляются/)).toBeTruthy();
    expect(container.textContent).not.toContain('password=secret-provider-detail');
  });

  it('shows a clear unavailable state when loading fails', async () => {
    usePermissionStore.setState({ permissions: ['email_templates:read'] });
    queueApi.getQueue.mockRejectedValueOnce(new Error('network detail'));

    await renderCard();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe(
      'Состояние очереди писем недоступно. Возможно, бот ещё не обновлён.',
    );
    expect(screen.queryByText('network detail')).toBeNull();
  });
});

describe('EmailQueueCard clearing', () => {
  it('confirms once, prevents a repeated request and refreshes after success', async () => {
    usePermissionStore.setState({
      permissions: ['email_templates:read', 'email_templates:edit'],
    });
    queueApi.getQueue
      .mockResolvedValueOnce({ ...emptyQueue, pending: 2 })
      .mockResolvedValue(emptyQueue);
    queueApi.clearQueue.mockResolvedValue({ removed: 2, pending_only: true });
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

    await renderCard();
    const clearPending = await screen.findByRole('button', { name: 'Убрать ожидающие' });
    fireEvent.click(clearPending);
    fireEvent.click(clearPending);

    await waitFor(() => expect(queueApi.clearQueue).toHaveBeenCalledTimes(1));
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(queueApi.clearQueue).toHaveBeenCalledWith(true);
    expect(await screen.findByText('Очередь очищена: 2')).toBeTruthy();
    await waitFor(() => expect(queueApi.getQueue).toHaveBeenCalledTimes(2));
  });

  it('does not clear when the administrator cancels the confirmation', async () => {
    usePermissionStore.setState({
      permissions: ['email_templates:read', 'email_templates:edit'],
    });
    queueApi.getQueue.mockResolvedValueOnce({ ...emptyQueue, sent: 1 });
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);

    await renderCard();
    fireEvent.click(await screen.findByRole('button', { name: 'Очистить' }));

    await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1));
    expect(queueApi.clearQueue).not.toHaveBeenCalled();
  });

  it('shows an error and unlocks the action after a failed clear request', async () => {
    usePermissionStore.setState({
      permissions: ['email_templates:read', 'email_templates:edit'],
    });
    queueApi.getQueue.mockResolvedValueOnce({ ...emptyQueue, dead: 1 });
    queueApi.clearQueue.mockRejectedValueOnce(new Error('private backend detail'));
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    await renderCard();
    const clearAll = await screen.findByRole('button', { name: 'Очистить' });
    fireEvent.click(clearAll);

    expect(await screen.findByText('Не удалось очистить очередь писем')).toBeTruthy();
    await waitFor(() => expect((clearAll as HTMLButtonElement).disabled).toBe(false));
    expect(queueApi.clearQueue).toHaveBeenCalledTimes(1);
    expect(queueApi.getQueue).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('private backend detail')).toBeNull();
  });
});
