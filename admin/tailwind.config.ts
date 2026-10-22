import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0b0c10',
        night: '#12141a',
        surface: '#181b23',
        surfaceHover: '#20242f',
        line: '#282c38',
        lineLight: '#383e4e',
        fg: '#f3f4f6',
        muted: '#9ca3af',
        dim: '#6b7280',
        lime: '#c2f04d',
        accent: '#c2f04d',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
