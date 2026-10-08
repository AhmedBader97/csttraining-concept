import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { useBasket } from '@/components/basket/BasketProvider';
import { fakeResponse, renderWithBasket } from '@/test/render';
import { BasketView } from '../BasketView';

function Seed({ places = 2 }: { places?: number }) {
  const { add } = useBasket();
  return (
    <button
      type="button"
      onClick={() => {
        add({ kind: 'course', slug: 'smsts', name: 'SMSTS', unitPrice: 495, places, delivery: 'online', date: '2026-11-02' });
        add({ kind: 'course', slug: 'seats', name: 'SEATS', unitPrice: null, delivery: 'online' });
      }}
    >
      seed
    </button>
  );
}

async function setUp(places?: number) {
  const user = userEvent.setup();
  renderWithBasket(
    <>
      <Seed places={places} />
      <BasketView />
    </>,
  );
  await user.click(screen.getByRole('button', { name: 'seed' }));
  return user;
}

async function fillDetails(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('First name'), 'Sam');
  await user.type(screen.getByLabelText('Last name'), 'Reilly');
  await user.type(screen.getByLabelText('Email'), 'sam@example.com');
  await user.type(screen.getByLabelText('Phone'), '07700 900123');
}

describe('<BasketView />', () => {
  beforeEach(() => {
    window.localStorage.clear();
    global.fetch = jest.fn(async () => fakeResponse({ totals: { net: 990, gross: 1188 } })) as jest.Mock;
  });

  it('suggests where to start when empty', () => {
    renderWithBasket(<BasketView />);
    expect(screen.getByRole('heading', { name: 'Your basket is empty' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse courses' })).toHaveAttribute('href', '/courses');
  });

  it('totals the basket with VAT and flags the price to confirm', async () => {
    await setUp();
    expect(screen.getByText('£990.00')).toBeInTheDocument();
    expect(screen.getByText('£198.00')).toBeInTheDocument();
    expect(screen.getByText('£1,188.00')).toBeInTheDocument();
    expect(screen.getByText(/One course has no published price/)).toBeInTheDocument();
  });

  it('updates places and removes lines', async () => {
    const user = await setUp();
    const places = screen.getByRole('spinbutton', { name: 'Places for SMSTS' });
    await user.clear(places);
    await user.type(places, '5');
    expect(screen.getByText(/qualifies for a bulk discount/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove SEATS' }));
    expect(screen.queryByText('SEATS')).not.toBeInTheDocument();
  });

  it('lists every problem and moves focus to the list', async () => {
    const user = await setUp();
    await user.type(screen.getByLabelText('Email'), 'sam@');
    await user.click(screen.getByRole('button', { name: /Place booking/ }));
    const summary = screen.getByRole('alert');
    expect(summary).toHaveFocus();
    expect(within(summary).getAllByRole('link').map((a) => a.textContent)).toEqual([
      'Enter a first name.',
      'Enter a last name.',
      'Enter an email address like name@company.co.uk.',
      'Enter a phone number so a coordinator can call about dates.',
    ]);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows what would be sent to WooCommerce, HubSpot and n8n, and sends nothing', async () => {
    const user = await setUp();
    await fillDetails(user);
    await user.click(screen.getByRole('button', { name: /Place booking/ }));
    expect(await screen.findByText(/they match the basket/)).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('/api/quote', expect.objectContaining({ method: 'POST' }));

    expect(screen.getByRole('tabpanel')).toHaveTextContent('/wp-json/wc/v3/orders');
    await user.click(screen.getByRole('tab', { name: 'HubSpot contact' }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('"phone": "+447700900123"');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'HubSpot deal' })).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('"price_to_confirm": "true"');
  });

  it('notices when the server prices it differently', async () => {
    global.fetch = jest.fn(async () => fakeResponse({ totals: { net: 1, gross: 1.2 } })) as jest.Mock;
    const user = await setUp();
    await fillDetails(user);
    await user.click(screen.getByRole('button', { name: /Place booking/ }));
    expect(await screen.findByText(/The server priced this differently/)).toBeInTheDocument();
  });

  it('starts again from an empty basket', async () => {
    const user = await setUp();
    await fillDetails(user);
    await user.click(screen.getByRole('button', { name: /Place booking/ }));
    await user.click(await screen.findByRole('button', { name: 'Empty the basket and start again' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Your basket is empty' })).toBeInTheDocument());
  });

  it('has no detectable accessibility problems', async () => {
    await setUp();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
