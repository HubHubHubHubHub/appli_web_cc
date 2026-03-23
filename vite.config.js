import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	test: {
		environment: 'jsdom',
		include: ['tests/**/*.test.js'],
		alias: {
			$lib: path.resolve(__dirname, './src/lib')
		}
	}
});
