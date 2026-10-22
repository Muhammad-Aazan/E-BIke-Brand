/**
 * SINGLE place to swap the brand.
 * - Change name / upper / descriptor and every "Crown" in the UI follows.
 * - Drop your logo in /public/brand/ and set logoSrc (e.g. '/brand/logo.svg').
 *   When logoSrc is set it replaces the placeholder emblem + wordmark in the header.
 * Keep `upper` at ~5 letters so the giant footer wordmark fits like the Figma design.
 */
export const brand = {
  name: 'Crown',
  upper: 'CROWN',
  descriptor: 'GROUP',
  logoSrc: '/brand/crown-logo.png',
  city: 'Los Angeles',
  tagline: 'Built to feel.',
} as const;
