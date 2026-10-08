import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { HeroSearch } from '../HeroSearch';

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

describe('<HeroSearch />', () => {
  beforeEach(() => push.mockClear());

  it('suggests matches as you type', async () => {
    const user = userEvent.setup();
    render(<HeroSearch />);
    const box = screen.getByRole('combobox', { name: 'Search courses and NVQs' });
    expect(box).toHaveAttribute('aria-expanded', 'false');
    await user.type(box, 'sssts');
    expect(box).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('option')[0]).toHaveTextContent('SSSTS');
  });

  it('opens the highlighted match with the keyboard', async () => {
    const user = userEvent.setup();
    render(<HeroSearch />);
    await user.type(screen.getByRole('combobox'), 'smsts{ArrowDown}');
    expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{Enter}');
    expect(push).toHaveBeenCalledWith('/courses/smsts');
  });

  it('searches the full list otherwise', async () => {
    const user = userEvent.setup();
    render(<HeroSearch />);
    await user.type(screen.getByRole('combobox'), 'green card');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(push).toHaveBeenCalledWith('/courses?q=green%20card');
  });

  it('has no detectable accessibility problems', async () => {
    const { container } = render(<HeroSearch />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
