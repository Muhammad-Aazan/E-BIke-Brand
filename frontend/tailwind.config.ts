import type { Config } from 'tailwindcss';

// Design tokens lifted 1:1 from the Figma file (e-bike-figma).
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0c0e0e', // page background
        surface: '#141717', // raised dark surface
        line: '#343b37', // hairlines / borders
        fg: '#efefe7', // primary text on dark
        muted: '#adb3af', // secondary text
        dim: '#78817c', // tertiary text
        lime: '#d2ec79', // accent
        paper: '#e8e8df', // light sections
        night: '#151a13', // text on light / on lime
        moss: '#575f55', // body text on light
      },
      fontFamily: {
        display: ['"Manrope Variable"', 'Manrope', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
