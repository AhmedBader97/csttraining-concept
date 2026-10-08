import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { getCourse } from '@/content/courses';
import { BasketProbe, readBasket, renderWithBasket } from '@/test/render';
import { BookingPanel } from '../BookingPanel';

const course = (slug: string) => getCourse(slug)!;

describe('<BookingPanel />', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.useFakeTimers({ now: new Date('2026-10-08T09:00:00'), advanceTimers: true });
  });
  afterEach(() => jest.useRealTimers());

  it('books classroom places at a venue on a date', async () => {
    const user = userEvent.setup();
    renderWithBasket(
      <>
        <BookingPanel course={course('smsts')} />
        <BasketProbe />
      </>,
    );
    await user.click(screen.getByRole('radio', { name: 'Classroom' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Venue' }), 'leeds');
    expect(screen.getByRole('combobox', { name: 'Start date' })).toHaveDisplayValue('Mon, 19 Oct 2026');
    await user.click(screen.getByRole('button', { name: 'One more place' }));
    expect(screen.getByText('£990')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add to basket' }));
    expect(readBasket(screen.getByTestId('basket')).items).toEqual([
      { slug: 'smsts', places: 2, unitPrice: 495, delivery: 'classroom', venue: 'leeds', date: '2026-10-19' },
    ]);
    expect(within(screen.getByRole('status')).getByRole('link', { name: 'Go to your basket' })).toHaveAttribute('href', '/basket');
  });

  it('mentions the bulk discount from 5 places', async () => {
    const user = userEvent.setup();
    renderWithBasket(<BookingPanel course={course('sssts')} />);
    const places = screen.getByRole('spinbutton', { name: 'Places' });
    await user.clear(places);
    await user.type(places, '5');
    expect(screen.getByText(/qualifies for a bulk discount/)).toBeInTheDocument();
  });

  it('charges the weekend price on a Saturday', async () => {
    const user = userEvent.setup();
    renderWithBasket(<BookingPanel course={course('temporary-works-supervisor')} />);
    expect(screen.getByText('£299')).toBeInTheDocument();
    const saturday = screen.getAllByRole('option').find((option) => option.textContent?.includes('(weekend)'))!;
    await user.selectOptions(screen.getByRole('combobox', { name: 'Start date' }), saturday);
    expect(screen.getByText('£280')).toBeInTheDocument();
  });

  it('skips dates for e-learning and says when a price needs confirming', () => {
    const { unmount } = renderWithBasket(<BookingPanel course={course('fire-marshal-e-learning')} />);
    expect(screen.getByText('Start as soon as you’ve booked.')).toBeInTheDocument();
    unmount();
    renderWithBasket(<BookingPanel course={course('seats')} />);
    expect(screen.getByText('A coordinator confirms the price for these dates.')).toBeInTheDocument();
  });

  it('has no detectable accessibility problems', async () => {
    jest.useRealTimers();
    const { container } = renderWithBasket(<BookingPanel course={course('smsts')} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
