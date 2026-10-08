import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { courses } from '@/content/courses';
import { courseEntry } from '@/lib/catalogue';
import { CourseCatalogue } from '../CourseCatalogue';

const replace = jest.fn();
let search = '';
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/courses',
  useSearchParams: () => new URLSearchParams(search),
}));

const entries = courses.map((course) => ({ ...courseEntry(course), category: course.category }));
const names = () => screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);

describe('<CourseCatalogue />', () => {
  beforeEach(() => {
    replace.mockClear();
    search = '';
  });

  it('lists every course to start with', () => {
    render(<CourseCatalogue entries={entries} />);
    expect(screen.getByRole('status')).toHaveTextContent(`${courses.length} courses`);
  });

  it('filters by type and delivery, and keeps the filters in the URL', async () => {
    const user = userEvent.setup();
    render(<CourseCatalogue entries={entries} />);
    await user.click(screen.getByRole('radio', { name: 'First aid' }));
    expect(names()).toEqual(['First Aid at Work']);
    await user.click(screen.getByRole('radio', { name: 'All' }));
    await user.click(screen.getByRole('checkbox', { name: 'E-learning' }));
    expect(names()).toEqual(expect.arrayContaining(['Fire Marshal', 'PRINCE2® 7 Bundle']));
    expect(names()).not.toContain('SMSTS');
    expect(replace).toHaveBeenLastCalledWith('/courses?delivery=e-learning', { scroll: false });
  });

  it('starts from a shared link', () => {
    search = 'q=supervisor';
    render(<CourseCatalogue entries={entries} />);
    expect(names()[0]).toBe('SSSTS');
  });

  it('offers to clear filters that match nothing', async () => {
    const user = userEvent.setup();
    render(<CourseCatalogue entries={entries} />);
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'helicopter');
    expect(screen.getByText('No courses match those filters.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear the filters' }));
    expect(screen.getByRole('status')).toHaveTextContent(`${courses.length} courses`);
  });

  it('points to matching NVQs', async () => {
    const user = userEvent.setup();
    render(<CourseCatalogue entries={entries} />);
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'carpentry');
    const note = screen.getByText(/NVQs also match/);
    expect(within(note).getByRole('link', { name: 'See the NVQs' })).toHaveAttribute('href', '/nvqs?q=carpentry');
  });
});
