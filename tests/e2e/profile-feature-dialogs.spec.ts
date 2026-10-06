import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

test('closes a contest game before returning from the section to Profile', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/contests': [
        {
          id: 1,
          slug: 'local',
          name: 'Local contest',
          description: null,
          prize_days: 1,
          is_available: true,
          already_played: false,
        },
      ],
      '/api/cabinet/contests/1': {
        round_id: 1,
        game_type: 'blitz',
        game_data: { button_text: 'Local action' },
        instructions: 'Local game instructions',
      },
    },
  });
  await page.goto('/contests');
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(page.getByText('Local game instructions', { exact: true })).toBeVisible();
  const dialogHeading = page.getByRole('heading', { name: 'Local contest', level: 2 });
  await dialogHeading.locator('..').getByRole('button').click();
  await expect(dialogHeading).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'Contests', level: 1 })).toBeVisible();
  await page.getByRole('main').getByRole('link', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL('/profile');
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('closes a poll before returning from the section to Profile', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/polls': [
        {
          id: 1,
          response_id: 1,
          title: 'Local poll',
          description: null,
          total_questions: 1,
          answered_questions: 0,
          is_completed: false,
          reward_amount: null,
        },
      ],
      '/api/cabinet/polls/1/start': {
        response_id: 1,
        current_question_index: 0,
        total_questions: 1,
        question: {
          id: 1,
          text: 'Local question',
          order: 0,
          options: [{ id: 1, text: 'Local answer', order: 0 }],
        },
      },
    },
  });
  await page.goto('/polls');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Local question', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'Polls', level: 1 })).toBeVisible();
  await page.getByRole('main').getByRole('link', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL('/profile');
  expect([...unexpectedApiRequests]).toEqual([]);
});
