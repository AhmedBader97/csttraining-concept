import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { useBasket } from '@/components/basket/BasketProvider';
import { renderWithBasket } from '@/test/render';
import { SiteHeader } from '../SiteHeader';

jest.mock('next/navigation', () => ({ usePathname: () => '/nvqs/bricklaying-level-2' }));

function AddButton() {
  const { add } = useBasket();
  return (
    <button type="button" onClick={() => add({ kind: 'course', slug: 'smsts', name: 'SMSTS', unitPrice: 495, places: 2 })}>
      add
    </button>
  );
}

describe('<SiteHeader />', () => {
  beforeEach(() => window.localStorage.clear());

  it('marks the current section', () => {
    renderWithBasket(<SiteHeader />);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('link', { name: 'NVQs' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Courses' })).not.toHaveAttribute('aria-current');
  });

  it('counts places in the basket', async () => {
    const user = userEvent.setup();
    renderWithBasket(
      <>
        <SiteHeader />
        <AddButton />
      </>,
    );
    expect(screen.getByRole('link', { name: 'Basket, 0 places' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'add' }));
    expect(screen.getByRole('link', { name: 'Basket, 2 places' })).toBeInTheDocument();
  });

  it('keeps the basket after a reload', async () => {
    window.localStorage.setItem(
      'cst-concept:basket',
      JSON.stringify({ items: [{ id: 'hsa|-|-|-', kind: 'course', slug: 'hsa', name: 'HSA', unitPrice: 115, places: 3 }] }),
    );
    await act(async () => {
      renderWithBasket(<SiteHeader />);
    });
    expect(screen.getByRole('link', { name: 'Basket, 3 places' })).toBeInTheDocument();
  });

  it('opens the menu and closes it with Escape, returning focus', async () => {
    const user = userEvent.setup();
    renderWithBasket(<SiteHeader />);
    await user.click(screen.getByRole('button', { name: 'Menu' }));
    expect(screen.getByRole('navigation', { name: 'Mobile' })).toBeVisible();
    expect(document.body).toHaveClass('has-open-menu');
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Menu' })).toHaveFocus();
    expect(document.body).not.toHaveClass('has-open-menu');
  });

  it('has no detectable accessibility problems', async () => {
    const { container } = renderWithBasket(<SiteHeader />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
