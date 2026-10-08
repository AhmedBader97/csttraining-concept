import localFont from 'next/font/local';

/**
 * Archivo, one variable family with a width axis: condensed for headings and
 * prices (like site signage), normal width for reading. Self-hosted through
 * next/font, preloaded, with a size-adjusted fallback so nothing jumps.
 */
export const archivo = localFont({
  src: '../../node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-archivo',
  display: 'swap',
  preload: true,
  adjustFontFallback: 'Arial',
  declarations: [{ prop: 'font-stretch', value: '62% 125%' }],
});
