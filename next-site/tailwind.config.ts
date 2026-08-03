import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'alpine-green': 'oklch(0.55 0.15 145)',
        'slate-mountain': 'oklch(0.35 0.02 250)',
      },
    },
  },
  plugins: [],
}
export default config
