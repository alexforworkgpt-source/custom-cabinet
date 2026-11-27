import { describe, expect, it } from 'vitest';
import { isMobileNavItemActive, isMobileNavScreen, mobileNavItems } from './mobileNavRoutes';

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

  it('показывает панель на странице продления подписки', () => {
    expect(isMobileNavScreen('/subscriptions/12/renew', items)).toBe(true);
    expect(isMobileNavScreen('/subscriptions/12/renew/', items)).toBe(true);
  });

  it('показывает нижнюю панель с активным профилем на главной админки', () => {
    for (const path of ['/admin', '/admin/']) {
      expect(isMobileNavScreen(path, items), path).toBe(true);
      expect(
        items.filter((item) => isMobileNavItemActive(path, item)).map(({ key }) => key),
      ).toEqual(['profile']);
    }
  });

  it('скрывает панель на вложенных экранах', () => {
    for (const path of ['/balance/top-up', '/support/new', '/admin/users/12']) {
      expect(isMobileNavScreen(path, items), path).toBe(false);
    }
  });

  it('принимает хвостовой слеш у точного экрана кнопки', () => {
    expect(isMobileNavScreen('/profile/', items)).toBe(true);
  });
});
