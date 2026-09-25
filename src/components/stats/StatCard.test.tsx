// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatCard } from './StatCard';

describe('StatCard mobile layout', () => {
  it('does not truncate a long monetary value', () => {
    render(<StatCard label="Заработано" value="12 345 678,90 ₽" icon={<svg />} />);
    expect(screen.getByText('12 345 678,90 ₽').className).not.toContain('truncate');
  });

  it('uses the card width to choose the narrow layout', () => {
    const { container } = render(<StatCard label="Заработано" value="1 ₽" icon={<svg />} />);
    expect(container.firstElementChild?.className).toContain('[container:stat-tile/inline-size]');
  });
});
