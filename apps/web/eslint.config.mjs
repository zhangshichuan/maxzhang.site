import js from '@eslint/js'
import betterTailwind from 'eslint-plugin-better-tailwindcss'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const eslintConfig = defineConfig([
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		plugins: {
			'react-hooks': reactHooks,
		},
		rules: reactHooks.configs.recommended.rules,
	},
	betterTailwind.configs['recommended'],
	{
		settings: {
			'better-tailwindcss': {
				entryPoint: 'src/globals.css',
			},
		},
		rules: {
			'better-tailwindcss/no-unknown-classes': 'off',
			'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
		},
	},
	globalIgnores([
		'node_modules/**',
		'.next/**',
		'.output/**',
		'src/routeTree.gen.ts',
		'src/features/posts/generated/**',
		'generated/**',
	]),
])

export default eslintConfig
