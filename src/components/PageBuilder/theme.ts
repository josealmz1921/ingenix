import type { PageBuilderTheme } from '@/src/page-builder';

/** The editor canvas uses Ingenix tokens, not the source site's theme. */
export const builderTheme: PageBuilderTheme = {
  '--pb-font-body': 'var(--font-dm-sans), sans-serif',
  '--pb-font-heading': 'var(--font-asap-sans), sans-serif',
};
