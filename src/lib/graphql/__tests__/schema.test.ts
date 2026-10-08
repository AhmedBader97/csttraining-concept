import { runQuery } from '../execute';

describe('GraphQL catalogue', () => {
  it('lists CITB courses with VAT-inclusive prices', async () => {
    const data = await runQuery<{ courses: Array<{ name: string; price: { net: number | null; gross: number | null; label: string } }> }>(
      '{ courses(category: "citb") { name price { net gross label } } }',
    );
    const smsts = data.courses.find((c) => c.name === 'SMSTS');
    expect(smsts?.price).toEqual({ net: 495, gross: 594, label: '£495 + VAT' });
  });

  it('follows a course to its refresher', async () => {
    const data = await runQuery<{ course: { refresher: { name: string } } }>('{ course(slug: "sssts") { refresher { name } } }');
    expect(data.course.refresher.name).toBe('SSSTS Refresher');
  });

  it('filters by delivery', async () => {
    const data = await runQuery<{ courses: Array<{ delivery: string[] }> }>('{ courses(delivery: E_LEARNING) { delivery } }');
    expect(data.courses.length).toBeGreaterThan(0);
    expect(data.courses.every((c) => c.delivery.includes('E_LEARNING'))).toBe(true);
  });

  it('finds NVQs by group and level and knows the grant rules', async () => {
    const data = await runQuery<{ nvqs: Array<{ title: string; card: { label: string }; citbGrant: boolean }> }>(
      '{ nvqs(group: MANAGEMENT, level: 7) { title card { label } citbGrant } }',
    );
    expect(data.nvqs).toEqual([{ title: 'Level 7 NVQ in Construction Senior Management', card: { label: 'Black Manager card' }, citbGrant: false }]);
  });

  it('searches courses and NVQs together', async () => {
    const data = await runQuery<{ search: Array<{ title: string; href: string }> }>('{ search(query: "scaffolding", limit: 2) { title href } }');
    expect(data.search.map((r) => r.href)).toEqual(['/nvqs/scaffolding-level-2', '/nvqs/scaffolding-level-3']);
  });

  it('rejects unknown fields', async () => {
    await expect(runQuery('{ courses { colour } }')).rejects.toThrow(/Cannot query field "colour"/);
  });
});
