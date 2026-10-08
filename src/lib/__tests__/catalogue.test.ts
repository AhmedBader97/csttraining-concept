import { buildCatalogue, searchCatalogue } from '../catalogue';

const catalogue = buildCatalogue();
const titles = (query: string, limit = 5) => searchCatalogue(catalogue, query, limit).map((entry) => entry.title);

describe('catalogue search', () => {
  it('finds a course by its short name first', () => {
    expect(titles('smsts')[0]).toBe('SMSTS');
    expect(titles('sssts')[0]).toBe('SSSTS');
  });

  it('understands what people call things', () => {
    expect(titles('green card')).toEqual(expect.arrayContaining(['HSA', 'Level 1 Health & Safety']));
    expect(titles('site manager', 3)).toEqual(expect.arrayContaining(['SMSTS', 'Level 6 NVQ in Construction Site Management']));
  });

  it('finds NVQs by trade and level', () => {
    const results = titles('bricklaying level 3');
    expect(results[0]).toBe('Level 3 NVQ in Bricklaying');
  });

  it('needs every word to match', () => {
    expect(titles('bricklaying nebosh')).toEqual([]);
  });

  it('returns everything for an empty query', () => {
    expect(searchCatalogue(catalogue, '   ')).toHaveLength(catalogue.length);
  });
});
