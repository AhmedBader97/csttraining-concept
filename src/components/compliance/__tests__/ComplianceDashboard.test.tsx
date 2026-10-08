import path from 'node:path';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BasketProbe, readBasket, renderWithBasket } from '@/test/render';
import { ComplianceDashboard } from '../ComplianceDashboard';

// The browser build fetches its WebAssembly over HTTP. Tests hand it the file's bytes instead.
jest.mock('sql.js', () => {
  const init = jest.requireActual('sql.js/dist/sql-wasm.js');
  const wasmBinary = jest.requireActual('node:fs').readFileSync(path.join(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm'));
  return { __esModule: true, default: () => init({ wasmBinary }) };
});

describe('<ComplianceDashboard />', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.useFakeTimers({ now: new Date('2026-10-08T09:00:00'), advanceTimers: true });
  });
  afterEach(() => jest.useRealTimers());

  async function open() {
    renderWithBasket(
      <>
        <ComplianceDashboard />
        <BasketProbe />
      </>,
    );
    return screen.findByRole('heading', { name: 'Needs booking' }, { timeout: 10000 });
  }

  it('summarises the made-up company', async () => {
    await open();
    expect(screen.getByText(/Northfield Build Ltd/)).toBeInTheDocument();
    expect(screen.getByText(/of people fully in date/)).toHaveTextContent('(21 of 25)');
  });

  it('books a renewal into the basket', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await open();
    const button = screen.getAllByRole('button', { name: /^Book / })[0]!;
    const course = button.textContent!.replace('Book ', '');
    await user.click(button);
    expect(button).toHaveTextContent('In basket');
    expect(readBasket(screen.getByTestId('basket')).items[0]?.slug).toBeTruthy();
    expect(screen.getByText(/1 renewal in your basket/)).toBeInTheDocument();
    expect(course).not.toBe('');
  });

  it('finds the records that need tidying', async () => {
    await open();
    const checks = screen.getByRole('region', { name: 'Data checks' });
    expect(within(checks).getByText(/Tom Barker \/ Tom barker share/)).toBeInTheDocument();
    expect(within(checks).getByText(/Ryan Fletcher/)).toBeInTheDocument();
    expect(within(checks).getByText(/Ben Ashworth, Plant operator/)).toBeInTheDocument();
  });

  it('imports the sample file and explains its two mistakes', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await open();
    await user.click(screen.getByRole('button', { name: /Try the sample file/ }));
    const result = screen.getByText(/Read 5 rows/).closest('[role="status"]')!;
    expect(result).toHaveTextContent('Added 3. 2 to fix:');
    expect(within(result as HTMLElement).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Line 4, email: “sam.reilly@example” isn’t an email address.',
      'Line 5, achieved_on: Use a date like 08/10/2024 or 2024-10-08.',
    ]);
    expect(screen.getByText(/of people fully in date/)).toHaveTextContent('of 28');
  });
});
