import { expect, test, type Locator, type Page } from '@playwright/test';
import type { GeoCheckResult, NodeInfo } from '../../src/api/adminRemnawave';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

const MANAGE_PERMISSIONS = ['remnawave:read', 'remnawave:manage'];
const START_GEOCHECK_ROUTE = '**/api/cabinet/admin/remnawave/nodes/*/geocheck';
const POLL_GEOCHECK_ROUTE = '**/api/cabinet/admin/remnawave/geocheck/*';
const SUPPORTED_NODE = makeNode('node-3-3', 'Supported 3.3', '3.3.0', '203.0.113.33');

const completedResult = {
  success: true,
  node_uuid: SUPPORTED_NODE.uuid,
  image: {
    format: 'svg',
    media_type: 'image/svg+xml',
    encoding: 'base64',
    data: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==',
  },
  raw_report: { country: 'DE', asn: 64500 },
  message: 'Mock report ready',
};

const telegramLaunchParams = new URLSearchParams({
  tgWebAppData: new URLSearchParams({
    auth_date: '1787443200',
    hash: 'browser-test-hash',
    signature: 'browser-test-signature',
    user: JSON.stringify({ id: 1, first_name: 'Browser', language_code: 'en' }),
  }).toString(),
  tgWebAppPlatform: 'tdesktop',
  tgWebAppThemeParams: JSON.stringify({
    bg_color: '#111827',
    text_color: '#f9fafb',
  }),
  tgWebAppVersion: '8.0',
}).toString();

function makeNode(uuid: string, name: string, nodeVersion: string, address: string): NodeInfo {
  return {
    uuid,
    name,
    address,
    country_code: 'DE',
    is_connected: true,
    is_disabled: false,
    is_node_online: true,
    is_xray_running: true,
    users_online: 1,
    xray_uptime: 3600,
    is_traffic_tracking_active: true,
    consumption_multiplier: 1,
    versions: { node: nodeVersion, xray: '25.8.3' },
    system: null,
    ips: [{ ip: address, status: 'OUTBOUND' }],
  };
}

function adminResponses(nodes: NodeInfo[], permissions = MANAGE_PERMISSIONS) {
  return {
    '/api/cabinet/auth/me/is-admin': { is_admin: true },
    '/api/cabinet/auth/me/permissions': {
      permissions,
      roles: ['geocheck_browser_test'],
      role_level: 100,
    },
    '/api/cabinet/admin/tickets/notifications/unread-count': { unread_count: 0 },
    '/api/cabinet/admin/remnawave/status': { is_configured: true },
    '/api/cabinet/admin/remnawave/system': null,
    '/api/cabinet/admin/remnawave/recap': null,
    '/api/cabinet/admin/remnawave/devices-stats': null,
    '/api/cabinet/admin/remnawave/top-consumers': null,
    '/api/cabinet/admin/remnawave/health': null,
    '/api/cabinet/admin/remnawave/subscription-requests': null,
    '/api/cabinet/admin/remnawave/nodes': { items: nodes, total: nodes.length },
    '/api/cabinet/admin/remnawave/nodes/realtime': [],
  };
}

async function prepareAdmin(
  page: Page,
  nodes = [SUPPORTED_NODE],
  permissions = MANAGE_PERMISSIONS,
) {
  return prepareAuthenticatedPage(page, {
    responses: adminResponses(nodes, permissions),
  });
}

async function openNodesPage(page: Page, nodeName: string, telegram = false) {
  if (telegram) {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'TelegramWebviewProxy', {
        configurable: true,
        value: { postEvent() {} },
      });
    });
  }

  await page.goto(`/admin/remnawave${telegram ? `#${telegramLaunchParams}` : ''}`);
  await expect(page.getByRole('heading', { name: 'Remnawave', exact: true })).toBeVisible();
  await page
    .locator('button')
    .filter({ has: page.getByText('Nodes', { exact: true }) })
    .click();
  await expect(page.getByRole('heading', { name: nodeName, exact: true })).toBeVisible();
}

function nodeCard(page: Page, nodeName: string) {
  return page
    .getByRole('heading', { name: nodeName, exact: true })
    .locator('xpath=ancestor::div[contains(@class, "rounded-xl")][1]');
}

async function openGeoCheck(page: Page, nodeName = SUPPORTED_NODE.name) {
  await nodeCard(page, nodeName).getByRole('button', { name: 'GeoCheck' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('GeoCheck', { exact: true })).toBeVisible();
  return dialog;
}

async function expectAtLeast44By44(locator: Locator) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  if (!box) throw new Error('Expected a visible GeoCheck control with a bounding box');
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
}

async function mockCompletedGeoCheck(
  page: Page,
  postBodies: unknown[] = [],
  result: GeoCheckResult = completedResult,
) {
  await page.route(START_GEOCHECK_ROUTE, async (route) => {
    postBodies.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, json: { job_id: 'completed-job' } });
  });
  await page.route(POLL_GEOCHECK_ROUTE, (route) =>
    route.fulfill({
      status: 200,
      json: {
        job_id: 'completed-job',
        is_completed: true,
        is_failed: false,
        result,
      },
    }),
  );
}

test('gates GeoCheck by node 3.3 and manage permission @desktop-flow', async ({ page }) => {
  const nodes = [
    makeNode('node-2-8', 'Legacy 2.8', '2.8.0', '203.0.113.28'),
    makeNode('node-3-2', 'Legacy 3.2', '3.2.9', '203.0.113.32'),
    SUPPORTED_NODE,
  ];
  const { unexpectedApiRequests } = await prepareAdmin(page, nodes);

  await openNodesPage(page, SUPPORTED_NODE.name);

  await expect(nodeCard(page, 'Legacy 2.8').getByRole('button', { name: 'GeoCheck' })).toHaveCount(
    0,
  );
  await expect(nodeCard(page, 'Legacy 3.2').getByRole('button', { name: 'GeoCheck' })).toHaveCount(
    0,
  );
  const trigger = nodeCard(page, SUPPORTED_NODE.name).getByRole('button', { name: 'GeoCheck' });
  await expectAtLeast44By44(trigger);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('shows a localized error when the report image cannot be decoded @desktop-flow', async ({
  page,
}) => {
  const { unexpectedApiRequests } = await prepareAdmin(page);
  await mockCompletedGeoCheck(page, [], {
    ...completedResult,
    image: {
      format: 'png',
      media_type: 'image/png',
      encoding: 'base64',
      data: 'bm90LWFuLWltYWdl',
    },
  });
  await openNodesPage(page, SUPPORTED_NODE.name);
  const dialog = await openGeoCheck(page);

  await dialog.getByRole('button', { name: 'Run check', exact: true }).click();

  await expect(dialog.getByRole('alert')).toHaveText('The report image could not be displayed.');
  await expect(dialog.getByRole('button', { name: 'Zoom in' })).toHaveCount(0);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('hides GeoCheck on node 3.3 without manage permission @desktop-flow', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAdmin(page, [SUPPORTED_NODE], ['remnawave:read']);

  await openNodesPage(page, SUPPORTED_NODE.name);

  await expect(
    nodeCard(page, SUPPORTED_NODE.name).getByRole('button', { name: 'GeoCheck' }),
  ).toHaveCount(0);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('posts an empty default route and renders a pending-to-completed report @desktop-flow', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, value: false });
  });
  const postBodies: unknown[] = [];
  const pollStates: string[] = [];
  const { unexpectedApiRequests } = await prepareAdmin(page);
  await page.route(START_GEOCHECK_ROUTE, async (route) => {
    postBodies.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, json: { job_id: 'polling-job' } });
  });
  await page.route(POLL_GEOCHECK_ROUTE, async (route) => {
    const pending = pollStates.length === 0;
    pollStates.push(pending ? 'pending' : 'completed');
    await route.fulfill({
      status: 200,
      json: pending
        ? { job_id: 'polling-job', is_completed: false, is_failed: false, result: null }
        : {
            job_id: 'polling-job',
            is_completed: true,
            is_failed: false,
            result: completedResult,
          },
    });
  });
  await openNodesPage(page, SUPPORTED_NODE.name);
  const dialog = await openGeoCheck(page);

  await dialog.getByRole('button', { name: 'Run check', exact: true }).click();

  await expect.poll(() => postBodies).toEqual([{}]);
  await expect.poll(() => pollStates).toEqual(['pending']);
  await expect(dialog.getByText('Running the geo check')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Close' })).toHaveCount(0);
  await expect(dialog.getByText('Mock report ready')).toBeVisible({ timeout: 7_000 });
  await expect(
    dialog.getByRole('img', { name: `GeoCheck report for ${SUPPORTED_NODE.name}` }),
  ).toBeVisible();
  expect(pollStates).toEqual(['pending', 'completed']);

  const fullscreenButton = dialog.getByRole('button', { name: 'Fullscreen' });
  await expect(fullscreenButton).toBeVisible();
  await fullscreenButton.click();
  await expect(fullscreenButton).toHaveAttribute('aria-pressed', 'true');
  const fullscreenBox = await dialog.boundingBox();
  expect(fullscreenBox?.width).toBeGreaterThanOrEqual(1270);
  expect(fullscreenBox?.height).toBeGreaterThanOrEqual(710);
  await dialog.getByRole('button', { name: 'Exit fullscreen' }).click();
  await expect(dialog.getByRole('button', { name: 'Fullscreen' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await expect(dialog.getByRole('button', { name: 'Close' })).toHaveCount(1);

  const toolbarButtons = [
    fullscreenButton,
    dialog.getByRole('button', { name: 'Copy JSON report' }),
    dialog.getByRole('button', { name: 'Download SVG' }),
    dialog.getByRole('button', { name: 'Run again' }),
    dialog.getByRole('button', { name: 'Zoom out' }),
    dialog.getByRole('button', { name: 'Zoom in' }),
    dialog.getByRole('button', { name: 'Reset zoom' }),
  ];
  for (const button of toolbarButtons) await expectAtLeast44By44(button);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('closes a reopened GeoCheck after the page reloads with its history marker @desktop-flow', async ({
  page,
}) => {
  const { unexpectedApiRequests } = await prepareAdmin(page);
  await openNodesPage(page, SUPPORTED_NODE.name);
  await openGeoCheck(page);

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Remnawave', exact: true })).toBeVisible();
  await page
    .locator('button')
    .filter({ has: page.getByText('Nodes', { exact: true }) })
    .click();
  await expect(page.getByRole('heading', { name: SUPPORTED_NODE.name, exact: true })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  const reopenedDialog = await openGeoCheck(page);
  await reopenedDialog.getByRole('button', { name: 'Close' }).last().click();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page
    .locator('button')
    .filter({ has: page.getByText('Overview', { exact: true }) })
    .click();
  await page.goForward();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('Telegram Back closes a reopened GeoCheck after reload @telegram-flow', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAdmin(page);
  await openNodesPage(page, SUPPORTED_NODE.name, true);
  await openGeoCheck(page);

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Remnawave', exact: true })).toBeVisible();
  await page
    .locator('button')
    .filter({ has: page.getByText('Nodes', { exact: true }) })
    .click();
  await expect(page.getByRole('heading', { name: SUPPORTED_NODE.name, exact: true })).toBeVisible();
  await openGeoCheck(page);

  await page.evaluate(() => {
    const host = window as typeof window & {
      Telegram?: { WebView?: { receiveEvent: (event: string) => void } };
    };
    host.Telegram?.WebView?.receiveEvent('back_button_pressed');
  });

  await expect(page).toHaveURL(/\/admin\/remnawave(?:#|$)/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('does not consume Telegram Back with stale GeoCheck history after reload @telegram-flow', async ({
  page,
}) => {
  await prepareAdmin(page);
  await openNodesPage(page, SUPPORTED_NODE.name, true);
  await openGeoCheck(page);

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Remnawave', exact: true })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.evaluate(() => {
    const host = window as typeof window & {
      Telegram?: { WebView?: { receiveEvent: (event: string) => void } };
    };
    host.Telegram?.WebView?.receiveEvent('back_button_pressed');
  });

  await expect(page).not.toHaveURL(/\/admin\/remnawave(?:#|$)/);
});

test('disables GeoCheck transform animations for reduced motion @desktop-flow', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const { unexpectedApiRequests } = await prepareAdmin(page);
  await mockCompletedGeoCheck(page);
  await openNodesPage(page, SUPPORTED_NODE.name);
  const dialog = await openGeoCheck(page);

  await dialog.getByRole('button', { name: 'Run check', exact: true }).click();
  await expect(dialog.getByText('Mock report ready')).toBeVisible();
  const transformedContent = dialog.locator('.react-transform-component');
  await dialog.getByRole('button', { name: 'Zoom in' }).click();
  const transformAfterClick = await transformedContent.getAttribute('style');
  await page.waitForTimeout(100);
  expect(await transformedContent.getAttribute('style')).toBe(transformAfterClick);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('preserves mobile safe areas in GeoCheck fullscreen @critical-flow', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-320', 'Mobile web fullscreen only');
  const { unexpectedApiRequests } = await prepareAdmin(page);
  await mockCompletedGeoCheck(page);
  await openNodesPage(page, SUPPORTED_NODE.name);
  const dialog = await openGeoCheck(page);

  await dialog.getByRole('button', { name: 'Run check', exact: true }).click();
  await expect(dialog.getByText('Mock report ready')).toBeVisible();
  await dialog.getByRole('button', { name: 'Fullscreen' }).click();

  await expect(dialog).toHaveClass(/safe-area-inset-top/);
  await expect(dialog).toHaveClass(/safe-area-inset-bottom/);
  await expect(dialog).toHaveClass(/safe-area-inset-left/);
  await expect(dialog).toHaveClass(/safe-area-inset-right/);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('blocks an invalid IP and posts an exact trimmed IPv6 route @desktop-flow', async ({
  page,
}) => {
  const postBodies: unknown[] = [];
  const { unexpectedApiRequests } = await prepareAdmin(page);
  await mockCompletedGeoCheck(page, postBodies);
  await openNodesPage(page, SUPPORTED_NODE.name);
  const dialog = await openGeoCheck(page);
  await dialog.getByRole('button', { name: 'IP address', exact: true }).click();
  const routeInput = dialog.getByRole('textbox', { name: 'IP address' });
  const runButton = dialog.getByRole('button', { name: 'Run check', exact: true });

  await routeInput.fill('999.1.1.1');
  await expect(dialog.getByText('Enter a valid IPv4 or IPv6 address')).toBeVisible();
  await expect(runButton).toBeDisabled();
  expect(postBodies).toEqual([]);

  await routeInput.fill('  2001:db8::5  ');
  await expect(dialog.getByText('Enter a valid IPv4 or IPv6 address')).toHaveCount(0);
  await expect(runButton).toBeEnabled();
  await runButton.click();

  await expect.poll(() => postBodies).toEqual([{ ip: '2001:db8::5' }]);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('hides fullscreen and download inside Telegram @telegram-flow', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAdmin(page);
  await mockCompletedGeoCheck(page);
  await openNodesPage(page, SUPPORTED_NODE.name, true);
  const dialog = await openGeoCheck(page);

  await dialog.getByRole('button', { name: 'Run check', exact: true }).click();
  await expect(dialog.getByText('Mock report ready')).toBeVisible();

  await expect(dialog.getByRole('button', { name: 'Fullscreen' })).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: 'Download SVG' })).toHaveCount(0);
  await expectAtLeast44By44(dialog.getByRole('button', { name: 'Copy JSON report' }));
  await expectAtLeast44By44(dialog.getByRole('button', { name: 'Run again' }));
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('shows a 403 start error without polling @desktop-flow', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAdmin(page);
  let pollAttempts = 0;
  await page.route(START_GEOCHECK_ROUTE, (route) =>
    route.fulfill({ status: 403, json: { detail: 'GeoCheck forbidden' } }),
  );
  await page.route(POLL_GEOCHECK_ROUTE, async (route) => {
    pollAttempts += 1;
    await route.fulfill({ status: 500, json: { detail: 'Polling was not expected' } });
  });
  await openNodesPage(page, SUPPORTED_NODE.name);
  const dialog = await openGeoCheck(page);

  await dialog.getByRole('button', { name: 'Run check', exact: true }).click();

  await expect(dialog.getByText('Check failed', { exact: true })).toBeVisible();
  await expect(dialog.getByText('GeoCheck forbidden', { exact: true })).toBeVisible();
  expect(pollAttempts).toBe(0);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('shows a failed polling result @desktop-flow', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAdmin(page);
  await page.route(START_GEOCHECK_ROUTE, (route) =>
    route.fulfill({ status: 200, json: { job_id: 'failed-job' } }),
  );
  await page.route(POLL_GEOCHECK_ROUTE, (route) =>
    route.fulfill({
      status: 200,
      json: {
        job_id: 'failed-job',
        is_completed: false,
        is_failed: true,
        result: { success: false, message: 'Node rejected the geo check' },
      },
    }),
  );
  await openNodesPage(page, SUPPORTED_NODE.name);
  const dialog = await openGeoCheck(page);

  await dialog.getByRole('button', { name: 'Run check', exact: true }).click();

  await expect(dialog.getByText('Check failed', { exact: true })).toBeVisible();
  await expect(dialog.getByText('Node rejected the geo check', { exact: true })).toBeVisible();
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('shows timeout after a clock-fast-forwarded three minutes @desktop-flow', async ({ page }) => {
  await page.clock.install();
  const { unexpectedApiRequests } = await prepareAdmin(page);
  let pollAttempts = 0;
  await page.route(START_GEOCHECK_ROUTE, (route) =>
    route.fulfill({ status: 200, json: { job_id: 'timeout-job' } }),
  );
  await page.route(POLL_GEOCHECK_ROUTE, async (route) => {
    pollAttempts += 1;
    await route.fulfill({
      status: 200,
      json: { job_id: 'timeout-job', is_completed: false, is_failed: false, result: null },
    });
  });
  await openNodesPage(page, SUPPORTED_NODE.name);
  const dialog = await openGeoCheck(page);
  await dialog.getByRole('button', { name: 'Run check', exact: true }).click();
  await expect.poll(() => pollAttempts).toBe(1);

  await page.clock.fastForward('03:00');

  await expect(dialog.getByText('Check failed', { exact: true })).toBeVisible();
  await expect(
    dialog.getByText('The node did not answer in time. Try running the check again.'),
  ).toBeVisible();
  expect(pollAttempts).toBeGreaterThanOrEqual(1);
  expect([...unexpectedApiRequests]).toEqual([]);
});
