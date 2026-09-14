// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { Link, MemoryRouter, Route, Routes, useParams } from 'react-router';
import { describe, expect, it } from 'vitest';
import { RemountOnParam } from './RemountOnParam';

let mounts = 0;

function Probe() {
  const { id } = useParams();
  const [seen] = useState(() => {
    mounts += 1;
    return id;
  });

  return (
    <div>
      <span data-testid="seen">{seen}</span>
      <Link to="/u/2">to-2</Link>
      <Link to="/u/2?tab=x">same-2</Link>
    </div>
  );
}

describe('RemountOnParam', () => {
  it('пересоздаёт страницу только при смене параметра адреса', () => {
    mounts = 0;
    render(
      <MemoryRouter initialEntries={['/u/1']}>
        <Routes>
          <Route
            path="/u/:id"
            element={
              <RemountOnParam name="id">
                <Probe />
              </RemountOnParam>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('seen').textContent).toBe('1');
    fireEvent.click(screen.getByText('to-2'));
    expect(screen.getByTestId('seen').textContent).toBe('2');
    expect(mounts).toBe(2);

    fireEvent.click(screen.getByText('same-2'));
    expect(mounts).toBe(2);
  });
});
