import { resolve } from 'path';
import { defineConfig } from 'vite';

const root = resolve(__dirname, './');
const outDir = resolve(__dirname, 'dist');

export default defineConfig({
	root,
	base: '/bubblegum/', // <-- ADD THIS LINE
	// base: '/',
	plugins: [],
	build: {
		outDir,
		emptyOutDir: true,
	},
});
