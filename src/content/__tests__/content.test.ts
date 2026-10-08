import { cardRoutes } from '../cards';
import { courses, getCourse } from '../courses';
import { nvqs } from '../nvqs';
import { venues } from '../venues';

describe('content', () => {
  it('has unique slugs', () => {
    const slugs = [...courses.map((c) => c.slug), ...nvqs.map((n) => n.slug)];
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('links every refresher to a real course', () => {
    for (const course of courses) {
      if (course.refresher) expect(getCourse(course.refresher)).toBeDefined();
    }
  });

  it('lists all 65 trade NVQs from the Level 2 & 3 page, at the published prices', () => {
    const trade = nvqs.filter((n) => n.group === 'trade');
    expect(trade).toHaveLength(65);
    expect(trade.every((n) => n.price === (n.level === 2 ? 895 : 1100))).toBe(true);
  });

  it('links every card route step to a page that exists', () => {
    for (const route of cardRoutes) {
      for (const step of route.steps) {
        if (!step.href) continue;
        const [path] = step.href.split('?');
        const [, section, slug] = path!.split('/');
        if (section === 'courses' && slug) expect(getCourse(slug)).toBeDefined();
        else expect(['nvqs', 'courses']).toContain(section);
      }
    }
  });

  it('has the seven permanent venues', () => {
    expect(venues).toHaveLength(7);
  });
});
