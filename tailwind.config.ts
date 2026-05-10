import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: { colors: { power: '#ffd21e', coal: '#111111', steel: '#2b2b2b' }, boxShadow: { glow: '0 0 40px rgba(255,210,30,.22)' } } }, plugins: [] };
export default config;
