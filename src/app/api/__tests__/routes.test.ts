/**
 * @jest-environment node
 */
import { GET as getCourse } from '../courses/[slug]/route';
import { GET as listCourses } from '../courses/route';
import { POST as graphql } from '../graphql/route';
import { GET as listNvqs } from '../nvqs/route';
import { POST as quote } from '../quote/route';

const post = (url: string, body: unknown) =>
  new Request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body) });

describe('REST API', () => {
  it('lists courses with filters', async () => {
    const response = listCourses(new Request('http://x/api/courses?category=citb&delivery=classroom'));
    const json = await response.json();
    expect(json.count).toBeGreaterThan(3);
    expect(json.courses.every((c: { category: string }) => c.category === 'citb')).toBe(true);
  });

  it('returns one course or a 404', async () => {
    const found = await getCourse(new Request('http://x'), { params: Promise.resolve({ slug: 'smsts' }) });
    expect((await found.json()).price_gross).toBe(594);
    const missing = await getCourse(new Request('http://x'), { params: Promise.resolve({ slug: 'nope' }) });
    expect(missing.status).toBe(404);
  });

  it('lists NVQs by level', async () => {
    const json = await listNvqs(new Request('http://x/api/nvqs?group=supervision&level=4')).json();
    expect(json.nvqs).toEqual([expect.objectContaining({ title: 'Level 4 NVQ in Site Supervision', price_gross: 1680 })]);
  });

  it('prices a basket on the server', async () => {
    const response = await quote(post('http://x/api/quote', { items: [{ slug: 'smsts', places: 2 }, { slug: 'carpentry-level-2', places: 1 }] }));
    const json = await response.json();
    expect(json.totals).toMatchObject({ places: 3, net: 1885, gross: 2262 });
  });

  it('refuses bad quotes with a reason', async () => {
    expect((await quote(post('http://x/api/quote', 'not json'))).status).toBe(400);
    expect((await quote(post('http://x/api/quote', { items: [{ slug: 'smsts', places: 0 }] }))).status).toBe(400);
    const unknown = await quote(post('http://x/api/quote', { items: [{ slug: 'jetpack', places: 1 }] }));
    expect(unknown.status).toBe(422);
    expect((await unknown.json()).error).toMatch(/jetpack/);
  });
});

describe('GraphQL endpoint', () => {
  it('answers queries over HTTP', async () => {
    const response = await graphql(post('http://x/api/graphql', { query: '{ venues { city } }' }));
    const json = await response.json();
    expect(json.data.venues).toHaveLength(7);
  });

  it('explains a bad request', async () => {
    const response = await graphql(post('http://x/api/graphql', { query: '' }));
    expect(response.status).toBe(400);
  });
});
