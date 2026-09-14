import { describe, expect, it } from 'vitest';
import { isMobileNavScreen, mobileNavItems } from './mobileNavRoutes';

describe('mobileNavItems', () => {
  it('сохраняет четыре пункта Custom Cabinet', () => {
    expect(mobileNavItems().map((item) => item.path)).toEqual([
      '/',
      '/subscription/purchase',
      '/support',
      '/profile',
    ]);
  });
});

describe('isMobileNavScreen', () => {
  const items = mobileNavItems();

  it('показывает панель только на экранах её кнопок', () => {
    for (const path of ['/', '/subscription/purchase', '/support', '/profile']) {
      expect(isMobileNavScreen(path, items), path).toBe(true);
    }
  });

  it('сохраняет панель на dashboard-контексте подписки', () => {
    for (const path of ['/subscriptions', '/subscriptions/', '/subscriptions/12']) {
      expect(isMobileNavScreen(path, items), path).toBe(true);
    }
  });

  it('скрывает панель на вложенных и административных экранах', () => {
    for (const path of [
      '/subscriptions/12/renew',
      '/balance/top-up',
      '/support/new',
      '/admin',
      '/admin/users/12',
    ]) {
      expect(isMobileNavScreen(path, items), path).toBe(false);
    }
  });

  it('принимает хвостовой слеш у точного экрана кнопки', () => {
    expect(isMobileNavScreen('/profile/', items)).toBe(true);
  });
});
