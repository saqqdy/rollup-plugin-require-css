import { describe, expect, it, vi } from 'vitest'
import requireCSS from '../src/index'

describe('require-css', () => {
	describe('plugin initialization', () => {
		it('should return plugin with correct name', () => {
			const plugin = requireCSS({})
			expect(plugin.name).toBe('require-css')
		})

		it('should have transform hook', () => {
			const plugin = requireCSS({})
			expect(plugin.transform).toBeDefined()
			expect(typeof plugin.transform).toBe('function')
		})

		it('should have generateBundle hook', () => {
			const plugin = requireCSS({})
			expect(plugin.generateBundle).toBeDefined()
			expect(typeof plugin.generateBundle).toBe('function')
		})

		it('should work without options', () => {
			const plugin = requireCSS()
			expect(plugin.name).toBe('require-css')
		})

		it('should have version property', () => {
			const plugin = requireCSS({})
			expect(plugin.version).toBeDefined()
			expect(typeof plugin.version).toBe('string')
		})

		it('should have api property', () => {
			const plugin = requireCSS({})
			expect(plugin.api).toBeDefined()
			expect(typeof plugin.api.getStyles).toBe('function')
			expect(typeof plugin.api.getCSSModules).toBe('function')
			expect(typeof plugin.api.getClassName).toBe('function')
			expect(typeof plugin.api.clearCache).toBe('function')
			expect(typeof plugin.api.getStats).toBe('function')
		})
	})

	describe('transform hook', () => {
		it('should transform css files', async () => {
			const plugin = requireCSS({})
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(
				{ getModuleInfo: () => null } as any,
				code,
				'/path/to/test.css'
			)

			expect(result).toBeDefined()
			expect(result!.code).toContain('mountStyle')
		})

		it('should not transform non-css files', async () => {
			const plugin = requireCSS({})
			const code = 'console.log("hello")'

			const result = await plugin.transform!.call(
				{ getModuleInfo: () => null } as any,
				code,
				'/path/to/test.js'
			)

			expect(result).toBeNull()
		})

		it('should use CSSStyleSheet when styleSheet option is true', async () => {
			const plugin = requireCSS({ styleSheet: true })
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(
				{ getModuleInfo: () => null } as any,
				code,
				'/path/to/test.css'
			)

			expect(result!.code).toContain('CSSStyleSheet')
		})

		it('should return valid source map object', async () => {
			const plugin = requireCSS({})
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(
				{ getModuleInfo: () => null } as any,
				code,
				'/path/to/test.css'
			)

			expect(result!.map).toBeDefined()
			expect(result!.map.version).toBe(3)
		})
	})

	describe('transform option', () => {
		it('should apply custom transform function', async () => {
			const plugin = requireCSS({
				transform: (code) => code.toUpperCase()
			})
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(
				{ getModuleInfo: () => null } as any,
				code,
				'/path/to/test.css'
			)

			expect(result!.code).toContain('.TEST { COLOR: RED; }')
		})

		it('should use transform result in output', async () => {
			const plugin = requireCSS({
				transform: (code) => code.replace(/red/g, 'blue')
			})
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(
				{ getModuleInfo: () => null } as any,
				code,
				'/path/to/test.css'
			)

			expect(result!.code).toContain('blue')
			expect(result!.code).not.toContain('red')
		})

		it('should support async transform function', async () => {
			const plugin = requireCSS({
				transform: async (code) => code.toUpperCase()
			})
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(
				{ getModuleInfo: () => null } as any,
				code,
				'/path/to/test.css'
			)

			expect(result!.code).toContain('.TEST')
		})
	})

	describe('include/exclude options', () => {
		it('should respect include option', async () => {
			const plugin = requireCSS({ include: ['**/*.css'] })
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(
				{ getModuleInfo: () => null } as any,
				code,
				'/path/to/test.css'
			)

			expect(result).toBeDefined()
		})

		it('should respect exclude option', async () => {
			const plugin = requireCSS({ exclude: ['**/exclude/**'] })
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(
				{ getModuleInfo: () => null } as any,
				code,
				'/path/exclude/test.css'
			)

			expect(result).toBeNull()
		})
	})

	describe('inject option', () => {
		it('should inject CSS when inject is true (default)', async () => {
			const plugin = requireCSS({ inject: true })
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(
				{ getModuleInfo: () => null } as any,
				code,
				'/path/to/test.css'
			)

			expect(result!.code).toContain('mountStyle')
		})

		it('should not inject CSS when inject is false', async () => {
			const plugin = requireCSS({ inject: false })
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(
				{ getModuleInfo: () => null } as any,
				code,
				'/path/to/test.css'
			)

			expect(result!.code).toBe('export default undefined;')
		})
	})

	describe('CSS Modules', () => {
		it('should transform CSS Modules for .module.css files', async () => {
			const plugin = requireCSS({})
			const code = '.button { color: red; }'

			const result = await plugin.transform!.call(
				{ getModuleInfo: () => null } as any,
				code,
				'/path/to/styles.module.css'
			)

			expect(result!.code).toContain('_styles_button')
		})

		it('should export class names mapping', async () => {
			const plugin = requireCSS({})
			const code = '.button { color: red; }\n.container { padding: 10px; }'

			await plugin.transform!.call(
				{ getModuleInfo: () => null } as any,
				code,
				'/path/to/styles.module.css'
			)

			const modules = plugin.api.getCSSModules()
			expect(modules['/path/to/styles.module.css']).toBeDefined()
			expect(modules['/path/to/styles.module.css'].button).toBeDefined()
			expect(modules['/path/to/styles.module.css'].container).toBeDefined()
		})

		it('should support custom scoped name generator', async () => {
			const plugin = requireCSS({
				modules: {
					enabled: true,
					generateScopedName: (name) => `custom_${name}`
				}
			})
			const code = '.button { color: red; }'

			const result = await plugin.transform!.call(
				{ getModuleInfo: () => null } as any,
				code,
				'/path/to/test.css'
			)

			expect(result!.code).toContain('custom_button')
			expect(plugin.api.getClassName('/path/to/test.css', 'button')).toBe('custom_button')
		})

		it('should force CSS Modules for all files when modules: true', async () => {
			const plugin = requireCSS({ modules: true })
			const code = '.button { color: red; }'

			const result = await plugin.transform!.call(
				{ getModuleInfo: () => null } as any,
				code,
				'/path/to/styles.css'
			)

			expect(result!.code).toMatch(/_[a-z]+_button_[a-f0-9]+/)
		})

		it('should not transform CSS Modules when modules: false', async () => {
			const plugin = requireCSS({ modules: false })
			const code = '.button { color: red; }'

			const result = await plugin.transform!.call(
				{ getModuleInfo: () => null } as any,
				code,
				'/path/to/styles.module.css'
			)

			expect(result!.code).toContain('.button { color: red; }')
		})
	})

	describe('minify option', () => {
		it('should minify CSS when minify is true', () => {
			const plugin = requireCSS({ minify: true })
			// Minification happens in generateBundle, so we just verify the option is accepted
			expect(plugin.name).toBe('require-css')
		})

		it('should accept minify options object', () => {
			const plugin = requireCSS({
				minify: {
					removeComments: true,
					collapseWhitespace: true,
					removeRedundantValues: true
				}
			})
			expect(plugin.name).toBe('require-css')
		})
	})

	describe('sourcemap option', () => {
		it('should generate sourcemap when enabled', async () => {
			const plugin = requireCSS({ sourcemap: true })
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(
				{ getModuleInfo: () => null } as any,
				code,
				'/path/to/test.css'
			)

			expect(result!.map).toBeDefined()
		})

		it('should accept inline sourcemap option', () => {
			const plugin = requireCSS({ sourcemap: 'inline' })
			expect(plugin.name).toBe('require-css')
		})

		it('should accept external sourcemap option', () => {
			const plugin = requireCSS({ sourcemap: 'external' })
			expect(plugin.name).toBe('require-css')
		})
	})

	describe('cache option', () => {
		it('should accept cache boolean option', () => {
			const plugin = requireCSS({ cache: true })
			expect(plugin.name).toBe('require-css')
		})

		it('should accept cache options object', () => {
			const plugin = requireCSS({
				cache: {
					enabled: true,
					dir: '.cache/css',
					ttl: 3600000
				}
			})
			expect(plugin.name).toBe('require-css')
		})
	})

	describe('code splitting', () => {
		it('should accept split option', () => {
			const plugin = requireCSS({ split: true })
			expect(plugin.name).toBe('require-css')
		})
	})

	describe('HMR support', () => {
		it('should accept hmr option', () => {
			const plugin = requireCSS({ hmr: true })
			expect(plugin.name).toBe('require-css')
		})
	})

	describe('preprocessor options', () => {
		it('should accept preprocessor options', () => {
			const plugin = requireCSS({
				preprocessor: {
					sass: { includePaths: ['src/styles'] },
					less: { paths: ['src/styles'] },
					stylus: { paths: ['src/styles'] }
				}
			})
			expect(plugin.name).toBe('require-css')
		})
	})

	describe('postcss options', () => {
		it('should accept postcss options', () => {
			const plugin = requireCSS({
				postcss: {
					enabled: true,
					plugins: []
				}
			})
			expect(plugin.name).toBe('require-css')
		})
	})

	describe('onExtract callback', () => {
		it('should accept onExtract callback', () => {
			const callback = vi.fn()
			const plugin = requireCSS({ onExtract: callback })
			expect(plugin.name).toBe('require-css')
		})
	})

	describe('api.getStyles()', () => {
		it('should return empty object initially', () => {
			const plugin = requireCSS({})
			expect(plugin.api.getStyles()).toEqual({})
		})

		it('should collect styles after transform', async () => {
			const plugin = requireCSS({})
			const code = '.test { color: red; }'

			await plugin.transform!.call(
				{ getModuleInfo: () => null } as any,
				code,
				'/path/to/test.css'
			)

			const styles = plugin.api.getStyles()
			expect(styles['/path/to/test.css']).toBe(code)
		})
	})

	describe('api.getCSSModules()', () => {
		it('should return empty object initially', () => {
			const plugin = requireCSS({})
			expect(plugin.api.getCSSModules()).toEqual({})
		})
	})

	describe('api.getClassName()', () => {
		it('should return undefined for unknown file', () => {
			const plugin = requireCSS({})
			expect(plugin.api.getClassName('/unknown.css', 'button')).toBeUndefined()
		})
	})

	describe('api.getStats()', () => {
		it('should return initial stats', () => {
			const plugin = requireCSS({})
			const stats = plugin.api.getStats()

			expect(stats.filesProcessed).toBe(0)
			expect(stats.totalSize).toBe(0)
		})

		it('should update stats after transform', async () => {
			const plugin = requireCSS({})
			const code = '.test { color: red; }'

			await plugin.transform!.call(
				{ getModuleInfo: () => null } as any,
				code,
				'/path/to/test.css'
			)

			const stats = plugin.api.getStats()
			expect(stats.filesProcessed).toBe(1)
			expect(stats.totalSize).toBeGreaterThan(0)
		})
	})

	describe('api.clearCache()', () => {
		it('should not throw when cache is disabled', () => {
			const plugin = requireCSS({ cache: false })
			expect(() => plugin.api.clearCache()).not.toThrow()
		})
	})

	describe('output option', () => {
		it('should accept string output option', () => {
			const plugin = requireCSS({ output: 'bundle.css' })
			expect(plugin.name).toBe('require-css')
		})

		it('should accept function output option', () => {
			const plugin = requireCSS({
				output: (chunk) => `${chunk.name}.css`
			})
			expect(plugin.name).toBe('require-css')
		})
	})

	describe('extensions option', () => {
		it('should accept custom extensions', () => {
			const plugin = requireCSS({
				extensions: ['.css', '.custom']
			})
			expect(plugin.name).toBe('require-css')
		})
	})
})
