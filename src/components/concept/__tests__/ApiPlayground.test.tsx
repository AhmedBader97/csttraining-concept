import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { fakeResponse } from '@/test/render';
import { ApiPlayground } from '../ApiPlayground';

describe('<ApiPlayground />', () => {
  beforeEach(() => {
    global.fetch = jest.fn(async () => fakeResponse({ data: { courses: [] } })) as jest.Mock;
  });

  it('sends the GraphQL query as JSON and shows the reply', async () => {
    const user = userEvent.setup();
    render(<ApiPlayground />);
    await user.click(screen.getByRole('button', { name: 'Send request' }));
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('/api/graphql');
    expect(JSON.parse(init.body).query).toContain('courses(category: "citb")');
    expect(await screen.findByText(/^200 in \d+ ms$/)).toBeInTheDocument();
  });

  it('switches to a REST request with no body', async () => {
    const user = userEvent.setup();
    render(<ApiPlayground />);
    await user.click(screen.getByRole('button', { name: 'REST: online courses' }));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Send request' }));
    expect((global.fetch as jest.Mock).mock.calls[0]).toEqual(['/api/courses?delivery=online', { method: 'GET', headers: undefined, body: undefined }]);
  });

  it('says so when the request fails', async () => {
    global.fetch = jest.fn(async () => {
      throw new TypeError('offline');
    }) as jest.Mock;
    const user = userEvent.setup();
    render(<ApiPlayground />);
    await user.click(screen.getByRole('button', { name: 'Send request' }));
    expect(await screen.findByText(/didn’t reach the server/)).toBeInTheDocument();
  });

  it('has no detectable accessibility problems', async () => {
    const { container } = render(<ApiPlayground />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
