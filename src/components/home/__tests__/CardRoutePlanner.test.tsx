import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { CardRoutePlanner } from '../CardRoutePlanner';

describe('<CardRoutePlanner />', () => {
  it('starts on the Blue card and shows its route', () => {
    render(<CardRoutePlanner />);
    expect(screen.getByRole('radio', { name: /Blue/ })).toHaveAttribute('aria-checked', 'true');
    const route = screen.getByRole('region', { name: 'Route to the Blue card' });
    expect(within(route).getAllByRole('listitem')).toHaveLength(3);
    expect(within(route).getByRole('link', { name: 'Level 2 NVQs, from £895 + VAT' })).toHaveAttribute('href', '/nvqs?level=2');
  });

  it('switches route when another card is picked', async () => {
    const user = userEvent.setup();
    render(<CardRoutePlanner />);
    await user.click(screen.getByRole('radio', { name: /Black/ }));
    expect(screen.getByRole('heading', { name: /The Black card/ })).toBeInTheDocument();
    expect(screen.getByText('Pass the CITB MAP test')).toBeInTheDocument();
  });

  it('moves between cards with the arrow keys, like any radio group', async () => {
    const user = userEvent.setup();
    render(<CardRoutePlanner initial="green" />);
    screen.getByRole('radio', { name: /Green/ }).focus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: /Black/ })).toHaveFocus();
    expect(screen.getByRole('radio', { name: /Black/ })).toHaveAttribute('aria-checked', 'true');
    await user.keyboard('{Home}');
    expect(screen.getByRole('radio', { name: /Green/ })).toHaveAttribute('aria-checked', 'true');
    // Only the chosen card is in the tab order.
    expect(screen.getAllByRole('radio').filter((radio) => radio.tabIndex === 0)).toHaveLength(1);
  });

  it('has no detectable accessibility problems', async () => {
    const { container } = render(<CardRoutePlanner />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
