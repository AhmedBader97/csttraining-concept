import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { NvqFinder } from '../NvqFinder';
import { PaymentPlans } from '../PaymentPlans';

let search = '';
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  usePathname: () => '/nvqs',
  useSearchParams: () => new URLSearchParams(search),
}));

describe('<NvqFinder />', () => {
  beforeEach(() => {
    search = '';
  });

  it('lists each trade once, with its levels side by side', async () => {
    const user = userEvent.setup();
    render(<NvqFinder />);
    await user.type(screen.getByRole('searchbox', { name: 'Find your trade' }), 'brick');
    const row = screen.getByRole('heading', { name: 'Bricklaying' }).closest('li')!;
    expect(within(row).getByRole('link', { name: /Level 2.*£895.*Blue card/ })).toHaveAttribute('href', '/nvqs/bricklaying-level-2');
    expect(within(row).getByRole('link', { name: /Level 3.*£1,100.*Gold card/ })).toBeInTheDocument();
  });

  it('filters by level', async () => {
    const user = userEvent.setup();
    render(<NvqFinder />);
    await user.click(screen.getByRole('radio', { name: 'Level 3' }));
    expect(screen.getByRole('status')).toHaveTextContent('20 NVQs');
  });

  it('switches to management NVQs from a link', () => {
    search = 'group=management';
    render(<NvqFinder />);
    expect(screen.getByRole('button', { name: /Management NVQs/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('link', { name: 'Level 7 NVQ in Construction Senior Management' })).toBeInTheDocument();
  });

  it('has no detectable accessibility problems', async () => {
    const { container } = render(<NvqFinder />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('<PaymentPlans />', () => {
  it('works out each plan for the price', async () => {
    const user = userEvent.setup();
    render(<PaymentPlans price={1400} />);
    expect(screen.getByText(/Total £1,512 with VAT, saving £140 before VAT/)).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Three payments/ }));
    expect(screen.getAllByRole('row')).toHaveLength(4);
    expect(screen.getByText(/Total £1,680 with VAT/)).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /0% finance/ }));
    expect(screen.getByText('£168 a month for 10 months, with VAT')).toBeInTheDocument();
  });

  it('has no detectable accessibility problems', async () => {
    const { container } = render(<PaymentPlans price={895} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
