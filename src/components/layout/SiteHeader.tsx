'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useBasket } from '@/components/basket/BasketProvider';
import { mainNav } from '@/config/site';
import { company } from '@/content/company';
import { Logo } from './Logo';

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname() ?? '/';
  const { totals } = useBasket();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  // Escape closes the menu and returns focus to the button; the page behind can't scroll while it's open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('has-open-menu');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('has-open-menu');
    };
  }, [open]);

  const basketLabel = totals.places === 1 ? 'Basket, 1 place' : `Basket, ${totals.places} places`;

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="site-header__brand" aria-label="CST Training home">
          <Logo />
        </Link>

        <nav className="site-header__nav" aria-label="Main">
          <ul className="site-header__list">
            {mainNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link href={item.href} className="site-header__link" aria-current={active ? 'page' : undefined}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="site-header__actions">
          <a href={company.phoneHref} className="site-header__phone">
            {company.phone}
          </a>
          <Link href="/basket" className="site-header__basket" aria-label={basketLabel}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
              <path d="M3 4h2.2l2.3 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6.3" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
              <circle cx="10" cy="20.3" r="1.4" fill="currentColor" />
              <circle cx="17.2" cy="20.3" r="1.4" fill="currentColor" />
            </svg>
            <span className="site-header__count" aria-hidden="true" data-empty={totals.places === 0 || undefined}>
              {totals.places}
            </span>
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="site-header__toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      <div id="mobile-menu" className="mobile-menu" hidden={!open}>
        <nav className="container" aria-label="Mobile">
          <ul className="mobile-menu__list">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="mobile-menu__link" aria-current={isActive(pathname, item.href) ? 'page' : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/contact" className="mobile-menu__link" aria-current={isActive(pathname, '/contact') ? 'page' : undefined}>
                Contact
              </Link>
            </li>
          </ul>
          <a href={company.phoneHref} className="button button--primary mobile-menu__call">
            Call {company.phone}
          </a>
        </nav>
      </div>
    </header>
  );
}
