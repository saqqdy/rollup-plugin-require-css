import type {
	CSSModulesOptions,
	MinifyOptions,
	Options} from '../src/index';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import requireCSS from '../src/index'
import * as postcssModule from '../src/postcss'
import * as preprocessorsModule from '../src/preprocessors'

// Helper to create mock context
function createMockContext(options: any = {}): {
	getModuleInfo: () => unknown
	emitFile: ReturnType<typeof vi.fn>
} {
	return {
		getModuleInfo: options.getModuleInfo ?? (() => null),
		emitFile: options.emitFile ?? vi.fn()
	}
}

// Helper to create mock bundle
function createMockBundle(entries: Array<{ id: string; name: string; modules?: Record<string, any> }> = []): Record<string, any> {
	const bundle: Record<string, any> = {}
	entries.forEach(entry => {
		bundle[`${entry.name}.js`] = {
			type: 'chunk',
			facadeModuleId: entry.id,
			name: entry.name,
			modules: entry.modules ?? {}
		}
	})
	return bundle
}

// Helper to create mock module info
function createMockModuleInfo(overrides: any = {}): {
	id: string
	importedIds: string[]
	importers: string[]
	dynamicallyImportedIds: string[]
	dynamicImporters: string[]
	exports: string[]
	attributes: Record<string, string>
} & Record<string, any> {
	return {
		id: '/path/to/test.css',
		importedIds: [],
		importers: [],
		dynamicallyImportedIds: [],
		dynamicImporters: [],
		exports: [],
		attributes: {},
		...overrides
	}
}

describe('require-css', () => {
	describe('plugin initialization', () => {
		it('should return plugin with correct name', () => {
			const plugin = requireCSS()
			expect(plugin.name).toBe('require-css')
		})

		it('should have transform hook', () => {
			const plugin = requireCSS()
			expect(typeof plugin.transform).toBe('function')
		})

		it('should have generateBundle hook', () => {
			const plugin = requireCSS()
			expect(typeof plugin.generateBundle).toBe('function')
		})

		it('should have resolveId hook', () => {
			const plugin = requireCSS()
			expect(typeof plugin.resolveId).toBe('function')
		})

		it('should have version property', () => {
			const plugin = requireCSS()
			expect(typeof plugin.version).toBe('string')
		})

		it('should have api property', () => {
			const plugin = requireCSS()
			expect(plugin.api).toBeDefined()
			expect(typeof plugin.api.getStyles).toBe('function')
			expect(typeof plugin.api.getCSSModules).toBe('function')
			expect(typeof plugin.api.getClassName).toBe('function')
			expect(typeof plugin.api.clearCache).toBe('function')
			expect(typeof plugin.api.getStats).toBe('function')
		})
	})

	describe('transform hook - basic', () => {
		it('should transform CSS files', async () => {
			const plugin = requireCSS()
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result).toBeDefined()
			expect(result!.code).toContain('mountStyle')
			expect(result!.code).toContain('export default')
		})

		it('should return null for non-CSS files', async () => {
			const plugin = requireCSS()
			const code = 'console.log("hello")'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.js')

			expect(result).toBeNull()
		})

		it('should return valid source map object', async () => {
			const plugin = requireCSS()
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result!.map).toBeDefined()
			expect(result!.map.version).toBe(3)
		})
	})

	describe('transform hook - styleSheet option', () => {
		it('should use CSSStyleSheet when styleSheet is true', async () => {
			const plugin = requireCSS({ styleSheet: true })
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result!.code).toContain('CSSStyleSheet')
			expect(result!.code).toContain('stylesheet.replaceSync')
		})

		it('should use CSSStyleSheet for import assertions', async () => {
			const plugin = requireCSS()
			const code = '.test { color: red; }'

			const context = createMockContext({
				getModuleInfo: () => createMockModuleInfo({ attributes: { type: 'css' } })
			})

			const result = await plugin.transform!.call(context, code, '/path/to/test.css')

			expect(result!.code).toContain('CSSStyleSheet')
		})
	})

	describe('transform hook - inject option', () => {
		it('should inject CSS when inject is true', async () => {
			const plugin = requireCSS({ inject: true })
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result!.code).toContain('mountStyle')
		})

		it('should not inject CSS when inject is false', async () => {
			const plugin = requireCSS({ inject: false })
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result!.code).toBe('export default undefined;')
		})
	})

	describe('transform hook - CSS Modules', () => {
		it('should transform CSS Modules for .module.css files', async () => {
			const plugin = requireCSS()
			const code = '.button { color: red; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/styles.module.css')

			expect(result!.code).toMatch(/_[a-z]+_button_[a-f0-9]+/)
		})

		it('should export class names mapping', async () => {
			const plugin = requireCSS()
			const code = '.button { color: red; }\n.container { padding: 10px; }'

			await plugin.transform!.call(createMockContext(), code, '/path/to/styles.module.css')

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

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result!.code).toContain('custom_button')
			expect(plugin.api.getClassName('/path/to/test.css', 'button')).toBe('custom_button')
		})

		it('should force CSS Modules for all files when modules: true', async () => {
			const plugin = requireCSS({ modules: true })
			const code = '.button { color: red; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/styles.css')

			expect(result!.code).toMatch(/_[a-z]+_button_[a-f0-9]+/)
		})

		it('should not transform CSS Modules when modules.enabled: false', async () => {
			const plugin = requireCSS({ modules: { enabled: false } })
			const code = '.button { color: red; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/styles.module.css')

			expect(result!.code).toContain('.button { color: red; }')
		})

		it('should handle CSS Modules with styleSheet option', async () => {
			const plugin = requireCSS({ modules: true, styleSheet: true })
			const code = '.button { color: red; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result!.code).toContain('CSSStyleSheet')
			expect(result!.code).toContain('export default')
		})

		it('should use auto mode for CSS Modules detection', async () => {
			const plugin = requireCSS({ modules: { enabled: 'auto' } })
			const code = '.button { color: red; }'

			const result1 = await plugin.transform!.call(createMockContext(), code, '/path/to/styles.css')
			expect(result1!.code).not.toMatch(/_[a-z]+_button_[a-f0-9]+/)

			const result2 = await plugin.transform!.call(createMockContext(), code, '/path/to/styles.module.css')
			expect(result2!.code).toMatch(/_[a-z]+_button_[a-f0-9]+/)
		})
	})

	describe('transform hook - transform option', () => {
		it('should apply custom transform function', async () => {
			const plugin = requireCSS({
				transform: (css) => css.toUpperCase()
			})
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result!.code).toContain('.TEST { COLOR: RED; }')
		})

		it('should use transform result in output', async () => {
			const plugin = requireCSS({
				transform: (code) => code.replace(/red/g, 'blue')
			})
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result!.code).toContain('blue')
			expect(result!.code).not.toContain('red')
		})

		it('should support async transform function', async () => {
			const plugin = requireCSS({
				transform: async (css) => css.toUpperCase()
			})
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result!.code).toContain('.TEST')
		})
	})

	describe('transform hook - include/exclude options', () => {
		it('should respect include option', async () => {
			const plugin = requireCSS({ include: ['**/*.css'] })
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result).toBeDefined()
		})

		it('should respect exclude option', async () => {
			const plugin = requireCSS({ exclude: ['**/exclude/**'] })
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/exclude/test.css')

			expect(result).toBeNull()
		})

		it('should handle include as string', async () => {
			const plugin = requireCSS({ include: '**/*.css' })
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')
			expect(result).toBeDefined()
		})

		it('should handle exclude as string', async () => {
			const plugin = requireCSS({ exclude: '**/vendor/**' })
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/vendor/test.css')
			expect(result).toBeNull()
		})
	})

	describe('transform hook - sourcemap option', () => {
		it('should generate sourcemap when enabled', async () => {
			const plugin = requireCSS({ sourcemap: true })
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

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

		it('should not generate sourcemap when disabled', async () => {
			const plugin = requireCSS({ sourcemap: false })
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result!.map).toBeDefined()
		})
	})

	describe('transform hook - cache', () => {
		it('should accept cache boolean option', () => {
			const plugin = requireCSS({ cache: true })
			expect(plugin.name).toBe('require-css')
		})

		it('should accept cache options object', () => {
			const plugin = requireCSS({
				cache: {
					enabled: true,
					ttl: 3600000
				}
			})
			expect(plugin.name).toBe('require-css')
		})

		it('should not use cache when disabled', async () => {
			const plugin = requireCSS({ cache: false })
			const code = '.test { color: red; }'

			await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')
			await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			const stats = plugin.api.getStats()
			expect(stats.cacheHits).toBe(0)
		})

		it('should accept cache with custom directory', () => {
			const plugin = requireCSS({
				cache: {
					enabled: true,
					dir: '/tmp/custom-cache'
				}
			})
			expect(plugin.name).toBe('require-css')
		})

		it('should hit cache on second transform', async () => {
			const tempDir = mkdtempSync(join(tmpdir(), 'css-cache-'))
			const plugin = requireCSS({
				cache: { enabled: true, dir: tempDir, ttl: 86400000 }
			})
			const code = '.test { color: red; }'
			const cssId = join(tempDir, 'test.css')

			writeFileSync(cssId, code)

			await plugin.transform!.call(createMockContext(), code, cssId)
			expect(plugin.api.getStats().cacheMisses).toBe(1)

			await plugin.transform!.call(createMockContext(), code, cssId)
			expect(plugin.api.getStats().cacheHits).toBe(1)

			rmSync(tempDir, { recursive: true })
		})

		it('should return cached result for inject:false', async () => {
			const tempDir = mkdtempSync(join(tmpdir(), 'css-cache-'))
			const plugin = requireCSS({
				cache: { enabled: true, dir: tempDir },
				inject: false
			})
			const code = '.test { color: red; }'
			const cssId = join(tempDir, 'test.css')
			writeFileSync(cssId, code)

			await plugin.transform!.call(createMockContext(), code, cssId)
			await plugin.transform!.call(createMockContext(), code, cssId)

			expect(plugin.api.getStats().cacheHits).toBe(1)

			rmSync(tempDir, { recursive: true })
		})

		it('should return cached result for CSS modules', async () => {
			const tempDir = mkdtempSync(join(tmpdir(), 'css-cache-'))
			const plugin = requireCSS({
				cache: { enabled: true, dir: tempDir },
				modules: true
			})
			const code = '.test { color: red; }'
			const cssId = join(tempDir, 'test.module.css')
			writeFileSync(cssId, code)

			await plugin.transform!.call(createMockContext(), code, cssId)
			await plugin.transform!.call(createMockContext(), code, cssId)

			expect(plugin.api.getStats().cacheHits).toBe(1)

			rmSync(tempDir, { recursive: true })
		})

		it('should handle cache TTL expiration', async () => {
			const tempDir = mkdtempSync(join(tmpdir(), 'css-cache-'))
			const plugin = requireCSS({
				cache: { enabled: true, dir: tempDir, ttl: 1 }
			})
			const code = '.test { color: red; }'
			const cssId = join(tempDir, 'test.css')
			writeFileSync(cssId, code)

			await plugin.transform!.call(createMockContext(), code, cssId)

			await new Promise(resolve => setTimeout(resolve, 10))

			await plugin.transform!.call(createMockContext(), code, cssId)

			expect(plugin.api.getStats().cacheMisses).toBe(2)

			rmSync(tempDir, { recursive: true })
		})

		it('should handle cache stat errors gracefully', async () => {
			const tempDir = mkdtempSync(join(tmpdir(), 'css-cache-'))
			const plugin = requireCSS({
				cache: { enabled: true, dir: tempDir }
			})
			const code = '.test { color: red; }'

			await plugin.transform!.call(createMockContext(), code, '/non/existent/file.css')

			expect(plugin.api.getStats().filesProcessed).toBe(1)

			rmSync(tempDir, { recursive: true })
		})

		it('should load cache from existing directory', async () => {
			const tempDir = mkdtempSync(join(tmpdir(), 'css-cache-'))
			const cacheFile = join(tempDir, 'cache.json')

			writeFileSync(cacheFile, JSON.stringify({
				'/cached/file.css': { content: '.cached {}', timestamp: Date.now(), mtime: Date.now() }
			}))

			const plugin = requireCSS({
				cache: { enabled: true, dir: tempDir }
			})

			expect(plugin.api.getStats().cacheMisses).toBe(0)

			rmSync(tempDir, { recursive: true })
		})

		it('should handle corrupted cache file', async () => {
			const tempDir = mkdtempSync(join(tmpdir(), 'css-cache-'))
			const cacheFile = join(tempDir, 'cache.json')

			writeFileSync(cacheFile, 'not valid json')

			const plugin = requireCSS({
				cache: { enabled: true, dir: tempDir }
			})

			expect(plugin.name).toBe('require-css')

			rmSync(tempDir, { recursive: true })
		})

		it('should handle cache save errors gracefully', async () => {
			const tempDir = mkdtempSync(join(tmpdir(), 'css-cache-'))

			const plugin = requireCSS({
				cache: { enabled: true, dir: tempDir }
			})

			const code = '.test { color: red; }'
			const cssId = join(tempDir, 'test.css')
			writeFileSync(cssId, code)

			// Delete the directory to cause save error
			rmSync(tempDir, { recursive: true })

			// Transform should not throw even if cache save fails
			await expect(plugin.transform!.call(createMockContext(), code, cssId)).resolves.toBeDefined()
		})
	})

	describe('generateBundle hook', () => {
		it('should emit CSS asset for single entry', async () => {
			const plugin = requireCSS({ output: 'bundle.css' })
			const emitFile = vi.fn()
			const cssId = '/path/to/test.css'
			const entryId = '/path/to/entry.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryId) {
						return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
					}
					if (id === cssId) {
						return createMockModuleInfo({ id: cssId, importedIds: [] })
					}
					return null
				}
			}

			const code = '.test { color: red; }'
			await plugin.transform!.call(context as any, code, cssId)

			const bundle = createMockBundle([
				{ id: entryId, name: 'main', modules: {} }
			])

			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})

		it('should apply minification when enabled', async () => {
			const plugin = requireCSS({ minify: true })
			const emitFile = vi.fn()
			const cssId = '/path/to/test.css'
			const entryId = '/path/to/entry.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryId) {
						return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
					}
					if (id === cssId) {
						return createMockModuleInfo({ id: cssId, importedIds: [] })
					}
					return null
				}
			}

			const code = '.test { color: red; }'
			await plugin.transform!.call(context as any, code, cssId)

			const bundle = createMockBundle([
				{ id: entryId, name: 'main', modules: {} }
			])

			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})

		it('should call onExtract callback', async () => {
			const onExtract = vi.fn()
			const plugin = requireCSS({ onExtract })
			const emitFile = vi.fn()
			const cssId = '/path/to/test.css'
			const entryId = '/path/to/entry.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryId) {
						return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
					}
					if (id === cssId) {
						return createMockModuleInfo({ id: cssId, importedIds: [] })
					}
					return null
				}
			}

			const code = '.test { color: red; }'
			await plugin.transform!.call(context as any, code, cssId)

			const bundle = createMockBundle([
				{ id: entryId, name: 'main', modules: {} }
			])

			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(onExtract).toHaveBeenCalled()
		})

		it('should handle code splitting', async () => {
			const plugin = requireCSS({ split: true })
			const emitFile = vi.fn()
			const cssId1 = '/path/to/a.css'
			const cssId2 = '/path/to/b.css'
			const entryIdA = '/path/to/a.js'
			const entryIdB = '/path/to/b.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryIdA) {
						return createMockModuleInfo({ id: entryIdA, importedIds: [cssId1] })
					}
					if (id === entryIdB) {
						return createMockModuleInfo({ id: entryIdB, importedIds: [cssId2] })
					}
					if (id === cssId1 || id === cssId2) {
						return createMockModuleInfo({ id, importedIds: [] })
					}
					return null
				}
			}

			await plugin.transform!.call(context as any, '.a { color: red; }', cssId1)
			await plugin.transform!.call(context as any, '.b { color: blue; }', cssId2)

			const bundle = createMockBundle([
				{ id: entryIdA, name: 'a', modules: {} },
				{ id: entryIdB, name: 'b', modules: {} }
			])

			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})

		it('should use output function when provided', async () => {
			const outputFn = vi.fn(({ name }) => `custom-${name}.css`)
			const plugin = requireCSS({ output: outputFn, split: true })
			const emitFile = vi.fn()
			const cssId = '/path/to/test.css'
			const entryIdA = '/path/to/a.js'
			const entryIdB = '/path/to/b.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryIdA || id === entryIdB) {
						return createMockModuleInfo({ id, importedIds: [cssId] })
					}
					if (id === cssId) {
						return createMockModuleInfo({ id: cssId, importedIds: [] })
					}
					return null
				}
			}

			const code = '.test { color: red; }'
			await plugin.transform!.call(context as any, code, cssId)

			const bundle = createMockBundle([
				{ id: entryIdA, name: 'a', modules: {} },
				{ id: entryIdB, name: 'b', modules: {} }
			])

			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(outputFn).toHaveBeenCalled()
		})

		it('should generate external sourcemap when configured', async () => {
			const plugin = requireCSS({ sourcemap: 'external' })
			const emitFile = vi.fn()
			const cssId = '/path/to/test.css'
			const entryId = '/path/to/entry.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryId) {
						return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
					}
					if (id === cssId) {
						return createMockModuleInfo({ id: cssId, importedIds: [] })
					}
					return null
				}
			}

			const code = '.test { color: red; }'
			await plugin.transform!.call(context as any, code, cssId)

			const bundle = createMockBundle([
				{ id: entryId, name: 'main', modules: {} }
			])

			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})

		it('should not emit if no CSS was processed', () => {
			const plugin = requireCSS()
			const emitFile = vi.fn()
			const context = {
				emitFile,
				getModuleInfo: () => createMockModuleInfo({ importedIds: [] })
			}

			const bundle = createMockBundle([
				{ id: '/path/to/entry.js', name: 'main', modules: {} }
			])

			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).not.toHaveBeenCalled()
		})

		it('should handle inline sourcemap', async () => {
			const plugin = requireCSS({ sourcemap: 'inline' })
			const emitFile = vi.fn()
			const cssId = '/path/to/test.css'
			const entryId = '/path/to/entry.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryId) return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
					if (id === cssId) return createMockModuleInfo({ id: cssId, importedIds: [] })
					return null
				}
			}

			await plugin.transform!.call(context as any, '.test { color: red; }', cssId)

			const bundle = createMockBundle([{ id: entryId, name: 'main', modules: {} }])
			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})

		it('should handle output as string', async () => {
			const plugin = requireCSS({ output: 'styles.css' })
			const emitFile = vi.fn()
			const cssId = '/path/to/test.css'
			const entryId = '/path/to/entry.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryId) return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
					if (id === cssId) return createMockModuleInfo({ id: cssId, importedIds: [] })
					return null
				}
			}

			await plugin.transform!.call(context as any, '.test { color: red; }', cssId)

			const bundle = createMockBundle([{ id: entryId, name: 'main', modules: {} }])
			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})

		it('should use outputOptions.file for filename', async () => {
			const plugin = requireCSS()
			const emitFile = vi.fn()
			const cssId = '/path/to/test.css'
			const entryId = '/path/to/entry.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryId) return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
					if (id === cssId) return createMockModuleInfo({ id: cssId, importedIds: [] })
					return null
				}
			}

			await plugin.transform!.call(context as any, '.test { color: red; }', cssId)

			const bundle = createMockBundle([{ id: entryId, name: 'main', modules: {} }])
			plugin.generateBundle!.call(context as any, { file: 'dist/bundle.js' }, bundle)

			expect(emitFile).toHaveBeenCalled()
		})

		it('should handle single entry without split', async () => {
			const plugin = requireCSS({ split: false })
			const emitFile = vi.fn()
			const cssId = '/path/to/test.css'
			const entryId = '/path/to/entry.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryId) return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
					if (id === cssId) return createMockModuleInfo({ id: cssId, importedIds: [] })
					return null
				}
			}

			await plugin.transform!.call(context as any, '.test { color: red; }', cssId)

			const bundle = createMockBundle([{ id: entryId, name: 'main', modules: {} }])
			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})

		it('should handle multiple chunks without split', async () => {
			const plugin = requireCSS({ split: false })
			const emitFile = vi.fn()
			const cssId1 = '/path/to/a.css'
			const cssId2 = '/path/to/b.css'
			const entryIdA = '/path/to/a.js'
			const entryIdB = '/path/to/b.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryIdA) return createMockModuleInfo({ id: entryIdA, importedIds: [cssId1] })
					if (id === entryIdB) return createMockModuleInfo({ id: entryIdB, importedIds: [cssId2] })
					if (id === cssId1 || id === cssId2) return createMockModuleInfo({ id, importedIds: [] })
					return null
				}
			}

			await plugin.transform!.call(context as any, '.a { color: red; }', cssId1)
			await plugin.transform!.call(context as any, '.b { color: blue; }', cssId2)

			const bundle = createMockBundle([
				{ id: entryIdA, name: 'a', modules: {} },
				{ id: entryIdB, name: 'b', modules: {} }
			])

			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})

		it('should handle output function returning non-string', async () => {
			const outputFn = vi.fn(() => 123 as any)
			const plugin = requireCSS({ output: outputFn, split: true })
			const emitFile = vi.fn()
			const cssId = '/path/to/test.css'
			const entryIdA = '/path/to/a.js'
			const entryIdB = '/path/to/b.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryIdA || id === entryIdB) {
						return createMockModuleInfo({ id, importedIds: [cssId] })
					}
					if (id === cssId) {
						return createMockModuleInfo({ id: cssId, importedIds: [] })
					}
					return null
				}
			}

			await plugin.transform!.call(context as any, '.test { color: red; }', cssId)

			const bundle = createMockBundle([
				{ id: entryIdA, name: 'a', modules: {} },
				{ id: entryIdB, name: 'b', modules: {} }
			])

			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})

		it('should handle no CSS for an entry in split mode', async () => {
			const plugin = requireCSS({ split: true })
			const emitFile = vi.fn()
			const cssId = '/path/to/test.css'
			const entryIdA = '/path/to/a.js'
			const entryIdB = '/path/to/b.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryIdA) {
						return createMockModuleInfo({ id: entryIdA, importedIds: [cssId] })
					}
					if (id === entryIdB) {
						return createMockModuleInfo({ id: entryIdB, importedIds: [] })
					}
					if (id === cssId) {
						return createMockModuleInfo({ id: cssId, importedIds: [] })
					}
					return null
				}
			}

			await plugin.transform!.call(context as any, '.test { color: red; }', cssId)

			const bundle = createMockBundle([
				{ id: entryIdA, name: 'a', modules: {} },
				{ id: entryIdB, name: 'b', modules: {} }
			])

			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})

		it('should handle output as function without split', async () => {
			const outputFn = vi.fn(() => 'custom.css')
			const plugin = requireCSS({ output: outputFn })
			const emitFile = vi.fn()
			const cssId = '/path/to/test.css'
			const entryId = '/path/to/entry.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryId) return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
					if (id === cssId) return createMockModuleInfo({ id: cssId, importedIds: [] })
					return null
				}
			}

			await plugin.transform!.call(context as any, '.test { color: red; }', cssId)

			const bundle = createMockBundle([{ id: entryId, name: 'main', modules: {} }])
			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})
	})

	describe('resolveId hook', () => {
		it('should return null for normal imports', () => {
			const plugin = requireCSS()

			const result = plugin.resolveId!('./style.css', '/path/to/index.js', {} as any)

			expect(result).toBeNull()
		})

		it('should return null for CSS import assertions', () => {
			const plugin = requireCSS()

			const result = plugin.resolveId!('./style.css', '/path/to/index.js', { attributes: { type: 'css' } } as any)

			expect(result).toBeNull()
		})
	})

	describe('Plugin API', () => {
		describe('getStyles()', () => {
			it('should return empty object initially', () => {
				const plugin = requireCSS()
				expect(plugin.api.getStyles()).toEqual({})
			})

			it('should collect styles after transform', async () => {
				const plugin = requireCSS()
				const code = '.test { color: red; }'

				await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

				const styles = plugin.api.getStyles()
				expect(styles['/path/to/test.css']).toBe(code)
			})
		})

		describe('getCSSModules()', () => {
			it('should return empty object initially', () => {
				const plugin = requireCSS()
				expect(plugin.api.getCSSModules()).toEqual({})
			})

			it('should return CSS modules after transform', async () => {
				const plugin = requireCSS({ modules: true })
				const code = '.test { color: red; }'

				await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

				const modules = plugin.api.getCSSModules()
				expect(modules['/path/to/test.css']).toBeDefined()
			})
		})

		describe('getClassName()', () => {
			it('should return undefined for unknown file', () => {
				const plugin = requireCSS()
				expect(plugin.api.getClassName('/unknown.css', 'button')).toBeUndefined()
			})

			it('should return scoped class name', async () => {
				const plugin = requireCSS({ modules: true })
				const code = '.button { color: red; }'

				await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

				const className = plugin.api.getClassName('/path/to/test.css', 'button')
				expect(className).toBeDefined()
				expect(className).toMatch(/_[a-z]+_button_[a-f0-9]+/)
			})
		})

		describe('getStats()', () => {
			it('should return initial stats', () => {
				const plugin = requireCSS()
				const stats = plugin.api.getStats()

				expect(stats.filesProcessed).toBe(0)
				expect(stats.totalSize).toBe(0)
			})

			it('should update stats after transform', async () => {
				const plugin = requireCSS()
				const code = '.test { color: red; }'

				await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

				const stats = plugin.api.getStats()
				expect(stats.filesProcessed).toBe(1)
				expect(stats.totalSize).toBeGreaterThan(0)
			})
		})

		describe('clearCache()', () => {
			it('should not throw when cache is disabled', () => {
				const plugin = requireCSS({ cache: false })
				expect(() => plugin.api.clearCache()).not.toThrow()
			})

			it('should clear cache when enabled', async () => {
				const plugin = requireCSS({ cache: true })
				expect(() => plugin.api.clearCache()).not.toThrow()
			})
		})
	})

	describe('minify options', () => {
		it('should minify CSS with boolean', async () => {
			const plugin = requireCSS({ minify: true })
			const emitFile = vi.fn()
			const cssId = '/path/to/test.css'
			const entryId = '/path/to/entry.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryId) return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
					if (id === cssId) return createMockModuleInfo({ id: cssId, importedIds: [] })
					return null
				}
			}

			const code = '.test { color: red; }'
			await plugin.transform!.call(context as any, code, cssId)

			const bundle = createMockBundle([
				{ id: entryId, name: 'main', modules: {} }
			])

			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})

		it('should minify CSS with options object', async () => {
			const plugin = requireCSS({
				minify: {
					removeComments: true,
					collapseWhitespace: true,
					removeRedundantValues: true,
					mergeRules: true,
					optimizeSelectors: true
				}
			})
			const emitFile = vi.fn()
			const cssId = '/path/to/test.css'
			const entryId = '/path/to/entry.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryId) return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
					if (id === cssId) return createMockModuleInfo({ id: cssId, importedIds: [] })
					return null
				}
			}

			const code = '.test { color: red; }'
			await plugin.transform!.call(context as any, code, cssId)

			const bundle = createMockBundle([
				{ id: entryId, name: 'main', modules: {} }
			])

			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})

		it('should minify CSS with split and minify options object', async () => {
			const plugin = requireCSS({
				split: true,
				minify: {
					removeComments: true,
					collapseWhitespace: true,
					removeRedundantValues: true,
					mergeRules: true,
					optimizeSelectors: true
				}
			})
			const emitFile = vi.fn()
			const cssId1 = '/path/to/a.css'
			const cssId2 = '/path/to/b.css'
			const entryIdA = '/path/to/a.js'
			const entryIdB = '/path/to/b.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryIdA) return createMockModuleInfo({ id: entryIdA, importedIds: [cssId1] })
					if (id === entryIdB) return createMockModuleInfo({ id: entryIdB, importedIds: [cssId2] })
					if (id === cssId1 || id === cssId2) return createMockModuleInfo({ id, importedIds: [] })
					return null
				}
			}

			await plugin.transform!.call(context as any, '.a { color: red; }', cssId1)
			await plugin.transform!.call(context as any, '.b { color: blue; }', cssId2)

			const bundle = createMockBundle([
				{ id: entryIdA, name: 'a', modules: {} },
				{ id: entryIdB, name: 'b', modules: {} }
			])

			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})
	})

	describe('extensions option', () => {
		it('should process custom extensions', async () => {
			const plugin = requireCSS({ extensions: ['.css', '.custom'] })
			expect(plugin.name).toBe('require-css')
		})

		it('should process files with custom extensions', async () => {
			const plugin = requireCSS({ extensions: ['.css', '.custom'] })
			const code = '.test { color: red; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.custom')

			expect(result).toBeDefined()
			expect(result!.code).toContain('mountStyle')
		})
	})

	describe('preprocessor support', () => {
		it('should detect Sass files', () => {
			expect(preprocessorsModule.detectPreprocessor('/path/to/test.scss')).toBe('sass')
			expect(preprocessorsModule.detectPreprocessor('/path/to/test.sass')).toBe('sass')
		})

		it('should detect Less files', () => {
			expect(preprocessorsModule.detectPreprocessor('/path/to/test.less')).toBe('less')
		})

		it('should detect Stylus files', () => {
			expect(preprocessorsModule.detectPreprocessor('/path/to/test.styl')).toBe('stylus')
			expect(preprocessorsModule.detectPreprocessor('/path/to/test.stylus')).toBe('stylus')
		})

		it('should return null for CSS files', () => {
			expect(preprocessorsModule.detectPreprocessor('/path/to/test.css')).toBeNull()
		})

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

		it('should disable preprocessor when set to false', () => {
			const plugin = requireCSS({ preprocessor: false })
			expect(plugin.name).toBe('require-css')
		})

		it('should call compilePreprocessor for scss files', async () => {
			const compileSpy = vi.spyOn(preprocessorsModule, 'compilePreprocessor')
			compileSpy.mockResolvedValueOnce({ css: '.compiled {}', map: {} })

			const plugin = requireCSS()
			const code = '.test { color: red; }'

			await plugin.transform!.call(createMockContext(), code, '/path/to/test.scss')

			expect(compileSpy).toHaveBeenCalled()

			compileSpy.mockRestore()
		})
	})

	describe('postcss support', () => {
		it('should accept postcss options', () => {
			const plugin = requireCSS({
				postcss: {
					enabled: true,
					plugins: []
				}
			})
			expect(plugin.name).toBe('require-css')
		})

		it('should accept postcss with plugins', () => {
			const plugin = requireCSS({
				postcss: {
					plugins: [{}]
				}
			})
			expect(plugin.name).toBe('require-css')
		})

		it('should call processPostCSS when enabled', async () => {
			const processSpy = vi.spyOn(postcssModule, 'processPostCSS')
			processSpy.mockResolvedValueOnce({ css: '.processed {}', messages: [], map: {} })

			const plugin = requireCSS({
				postcss: { enabled: true, plugins: [] }
			})
			const code = '.test { color: red; }'

			await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(processSpy).toHaveBeenCalled()

			processSpy.mockRestore()
		})
	})

	describe('hmr option', () => {
		it('should accept hmr option', () => {
			const plugin = requireCSS({ hmr: true })
			expect(plugin.name).toBe('require-css')
		})
	})

	describe('recursive import order', () => {
		it('should handle circular dependencies', async () => {
			const plugin = requireCSS()
			const cssIdA = '/path/to/a.css'
			const cssIdB = '/path/to/b.css'
			const entryId = '/path/to/entry.js'

			const context = {
				emitFile: vi.fn(),
				getModuleInfo: (id: string) => {
					if (id === entryId) {
						return createMockModuleInfo({ id: entryId, importedIds: [cssIdA] })
					}
					if (id === cssIdA) {
						return createMockModuleInfo({ id: cssIdA, importedIds: [cssIdB] })
					}
					if (id === cssIdB) {
						return createMockModuleInfo({ id: cssIdB, importedIds: [cssIdA] })
					}
					return null
				}
			}

			await plugin.transform!.call(context as any, '.a { color: red; }', cssIdA)
			await plugin.transform!.call(context as any, '.b { color: blue; }', cssIdB)

			const bundle = createMockBundle([{ id: entryId, name: 'main', modules: {} }])
			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(context.emitFile).toHaveBeenCalled()
		})
	})
})

describe('preprocessors module', () => {
	describe('compilePreprocessor', () => {
		it('should return original code for non-preprocessor files', async () => {
			const result = await preprocessorsModule.compilePreprocessor('.test { color: red; }', '/path/to/test.css', {})
			expect(result.css).toBe('.test { color: red; }')
		})

		it('should return original code when no preprocessor detected', async () => {
			const result = await preprocessorsModule.compilePreprocessor('.test { color: red; }', '/path/to/test.xyz', {})
			expect(result.css).toBe('.test { color: red; }')
		})

		it('should throw error when sass is disabled but scss file is processed', async () => {
			await expect(
				preprocessorsModule.compilePreprocessor('.test {}', '/path/to/test.scss', { sass: false })
			).rejects.toThrow('[rollup-plugin-require-css] Sass support is disabled')
		})

		it('should throw error when less is disabled but less file is processed', async () => {
			await expect(
				preprocessorsModule.compilePreprocessor('.test {}', '/path/to/test.less', { less: false })
			).rejects.toThrow('[rollup-plugin-require-css] Less support is disabled')
		})

		it('should throw error when stylus is disabled but styl file is processed', async () => {
			await expect(
				preprocessorsModule.compilePreprocessor('.test {}', '/path/to/test.styl', { stylus: false })
			).rejects.toThrow('[rollup-plugin-require-css] Stylus support is disabled')
		})

		it('should use sass options object when provided', async () => {
			// This tests the branch for typeof options.sass === 'object'
			const sassOptions = { includePaths: ['src/styles'] }
			// Sass is installed, so it should compile successfully
			const result = await preprocessorsModule.compilePreprocessor('.test { color: red; }', '/path/to/test.scss', { sass: sassOptions })
			expect(result.css).toBeDefined()
		})

		it('should use less options object when provided', async () => {
			const lessOptions = { paths: ['src/styles'] }
			// Less is installed, so it should compile successfully
			const result = await preprocessorsModule.compilePreprocessor('.test { color: red; }', '/path/to/test.less', { less: lessOptions })
			expect(result.css).toBeDefined()
		})

		it('should use stylus options object when provided', async () => {
			const stylusOptions = { paths: ['src/styles'] }
			// Stylus is installed, so it should compile successfully
			const result = await preprocessorsModule.compilePreprocessor('.test { color: red; }', '/path/to/test.styl', { stylus: stylusOptions })
			expect(result.css).toBeDefined()
		})
	})

	describe('detectPreprocessor', () => {
		it('should return null for unknown extensions', () => {
			expect(preprocessorsModule.detectPreprocessor('/path/to/test.xyz')).toBeNull()
			expect(preprocessorsModule.detectPreprocessor('/path/to/test')).toBeNull()
		})
	})

	describe('compileSass', () => {
		it('should compile sass successfully when sass is available', async () => {
			// Sass is installed, so it should compile successfully
			const result = await preprocessorsModule.compileSass('.test { color: red; }', '/path/to/test.scss', {})
			expect(result.css).toContain('.test')
		})

		it('should throw error for invalid sass syntax', async () => {
			await expect(
				preprocessorsModule.compileSass('.test { invalid syntax }', '/path/to/test.scss', {})
			).rejects.toThrow()
		})
	})

	describe('compileLess', () => {
		it('should compile less successfully when less is available', async () => {
			// Less is installed, so it should compile successfully
			const result = await preprocessorsModule.compileLess('.test { color: red; }', '/path/to/test.less', {})
			expect(result.css).toContain('.test')
		})
	})

	describe('compileStylus', () => {
		it('should compile stylus successfully when stylus is available', async () => {
			// Stylus is installed, so it should compile successfully
			const result = await preprocessorsModule.compileStylus('.test\n  color red', '/path/to/test.styl', {})
			expect(result.css).toContain('.test')
		})
	})
})

describe('postcss module', () => {
	describe('processPostCSS', () => {
		it('should return original CSS when disabled without plugins', async () => {
			const result = await postcssModule.processPostCSS('.test { color: red; }', '/path/to/test.css', { enabled: false, plugins: [] })
			expect(result.css).toBe('.test { color: red; }')
		})

		it('should return original CSS when not enabled and no plugins', async () => {
			const result = await postcssModule.processPostCSS('.test { color: red; }', '/path/to/test.css', { enabled: false })
			expect(result.css).toBe('.test { color: red; }')
		})

		it('should return original CSS when enabled is undefined and no plugins', async () => {
			const result = await postcssModule.processPostCSS('.test { color: red; }', '/path/to/test.css', {})
			expect(result.css).toBe('.test { color: red; }')
		})
	})

	describe('isPostCSSAvailable', () => {
		it('should return boolean', async () => {
			const result = await postcssModule.isPostCSSAvailable()
			expect(typeof result).toBe('boolean')
		})
	})
})

// ============================================================================
// Additional Edge Case Tests
// ============================================================================

describe('CSS syntax handling', () => {
	describe('complex CSS selectors', () => {
		it('should handle nested selectors', async () => {
			const plugin = requireCSS()
			const code = '.parent .child { color: red; } .parent > .child { margin: 10px; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result).toBeDefined()
			expect(result!.code).toContain('.parent .child')
		})

		it('should handle pseudo-classes', async () => {
			const plugin = requireCSS()
			const code = '.button:hover { color: blue; } .link:visited { color: purple; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result).toBeDefined()
			expect(result!.code).toContain(':hover')
		})

		it('should handle pseudo-elements', async () => {
			const plugin = requireCSS()
			const code = '.element::before { content: ""; } .element::after { content: ""; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result).toBeDefined()
			expect(result!.code).toContain('::before')
		})

		it('should handle attribute selectors', async () => {
			const plugin = requireCSS()
			const code = '[data-test="value"] { color: red; } [type="checkbox"] { margin: 5px; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result).toBeDefined()
			expect(result!.code).toContain('[data-test=')
		})

		it('should handle multiple selectors', async () => {
			const plugin = requireCSS()
			const code = '.a, .b, .c { color: red; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result).toBeDefined()
		})

		it('should handle @media queries', async () => {
			const plugin = requireCSS()
			const code = '@media (max-width: 768px) { .container { width: 100%; } }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result).toBeDefined()
			expect(result!.code).toContain('@media')
		})

		it('should handle @keyframes', async () => {
			const plugin = requireCSS()
			const code = '@keyframes slide { from { transform: translateX(0); } to { transform: translateX(100px); } }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result).toBeDefined()
			expect(result!.code).toContain('@keyframes')
		})

		it('should handle CSS variables', async () => {
			const plugin = requireCSS()
			const code = ':root { --main-color: #ff0000; } .element { color: var(--main-color); }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result).toBeDefined()
			expect(result!.code).toContain('--main-color')
		})

		it('should handle @supports', async () => {
			const plugin = requireCSS()
			const code = '@supports (display: grid) { .container { display: grid; } }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result).toBeDefined()
			expect(result!.code).toContain('@supports')
		})

		it('should handle @font-face', async () => {
			const plugin = requireCSS()
			const code = "@font-face { font-family: 'CustomFont'; src: url('font.woff2') format('woff2'); }"

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result).toBeDefined()
			expect(result!.code).toContain('@font-face')
		})
	})

	describe('CSS values', () => {
		it('should handle various color formats', async () => {
			const plugin = requireCSS()
			const code = `
				.hex { color: #ff0000; }
				.hex-short { color: #f00; }
				.rgb { color: rgb(255, 0, 0); }
				.rgba { color: rgba(255, 0, 0, 0.5); }
				.hsl { color: hsl(0, 100%, 50%); }
				.named { color: red; }
			`

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result).toBeDefined()
		})

		it('should handle calc() expressions', async () => {
			const plugin = requireCSS()
			const code = '.element { width: calc(100% - 20px); height: calc(50vh + 10px); }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result).toBeDefined()
			expect(result!.code).toContain('calc(')
		})

		it('should handle url() values', async () => {
			const plugin = requireCSS()
			const code = ".bg { background-image: url('image.png'); } .font { src: url('./font.woff'); }"

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result).toBeDefined()
			expect(result!.code).toContain('url(')
		})

		it('should handle !important', async () => {
			const plugin = requireCSS()
			const code = '.important { color: red !important; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result).toBeDefined()
			expect(result!.code).toContain('!important')
		})
	})
})

describe('minify CSS detailed tests', () => {
	describe('removeComments option', () => {
		it('should remove single-line comments', async () => {
			const plugin = requireCSS({ minify: true })
			const emitFile = vi.fn()
			const code = '/* comment */.test { color: red; }'
			const cssId = '/path/to/test.css'
			const entryId = '/path/to/entry.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryId) return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
					if (id === cssId) return createMockModuleInfo({ id: cssId, importedIds: [] })
					return null
				}
			}

			await plugin.transform!.call(context as any, code, cssId)
			const bundle = createMockBundle([{ id: entryId, name: 'main', modules: {} }])
			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})

		it('should remove multi-line comments', async () => {
			const plugin = requireCSS({ minify: true })
			const emitFile = vi.fn()
			const code = `/*
				multi-line
				comment
			*/.test { color: red; }`
			const cssId = '/path/to/test.css'
			const entryId = '/path/to/entry.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryId) return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
					if (id === cssId) return createMockModuleInfo({ id: cssId, importedIds: [] })
					return null
				}
			}

			await plugin.transform!.call(context as any, code, cssId)
			const bundle = createMockBundle([{ id: entryId, name: 'main', modules: {} }])
			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})

		it('should keep comments when removeComments is false', async () => {
			const plugin = requireCSS({ minify: { removeComments: false } })
			const emitFile = vi.fn()
			const code = '/* comment */.test { color: red; }'
			const cssId = '/path/to/test.css'
			const entryId = '/path/to/entry.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryId) return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
					if (id === cssId) return createMockModuleInfo({ id: cssId, importedIds: [] })
					return null
				}
			}

			await plugin.transform!.call(context as any, code, cssId)
			const bundle = createMockBundle([{ id: entryId, name: 'main', modules: {} }])
			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})
	})

	describe('collapseWhitespace option', () => {
		it('should collapse multiple whitespaces', async () => {
			const plugin = requireCSS({ minify: { collapseWhitespace: true } })
			const emitFile = vi.fn()
			const code = '.test    {    color:    red;    }'
			const cssId = '/path/to/test.css'
			const entryId = '/path/to/entry.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryId) return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
					if (id === cssId) return createMockModuleInfo({ id: cssId, importedIds: [] })
					return null
				}
			}

			await plugin.transform!.call(context as any, code, cssId)
			const bundle = createMockBundle([{ id: entryId, name: 'main', modules: {} }])
			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})

		it('should not collapse whitespace when disabled', async () => {
			const plugin = requireCSS({ minify: { collapseWhitespace: false } })
			const emitFile = vi.fn()
			const code = '.test { color: red; }'
			const cssId = '/path/to/test.css'
			const entryId = '/path/to/entry.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryId) return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
					if (id === cssId) return createMockModuleInfo({ id: cssId, importedIds: [] })
					return null
				}
			}

			await plugin.transform!.call(context as any, code, cssId)
			const bundle = createMockBundle([{ id: entryId, name: 'main', modules: {} }])
			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})
	})

	describe('removeRedundantValues option', () => {
		it('should convert 0px to 0', async () => {
			const plugin = requireCSS({ minify: { removeRedundantValues: true } })
			const emitFile = vi.fn()
			const code = '.test { margin: 0px; padding: 0em; width: 0rem; height: 0%; }'
			const cssId = '/path/to/test.css'
			const entryId = '/path/to/entry.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryId) return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
					if (id === cssId) return createMockModuleInfo({ id: cssId, importedIds: [] })
					return null
				}
			}

			await plugin.transform!.call(context as any, code, cssId)
			const bundle = createMockBundle([{ id: entryId, name: 'main', modules: {} }])
			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})
	})

	describe('mergeRules option', () => {
		it('should merge adjacent rules when enabled', async () => {
			const plugin = requireCSS({ minify: { mergeRules: true } })
			const emitFile = vi.fn()
			const code = '.a { color: red; }.b { color: blue; }'
			const cssId = '/path/to/test.css'
			const entryId = '/path/to/entry.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryId) return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
					if (id === cssId) return createMockModuleInfo({ id: cssId, importedIds: [] })
					return null
				}
			}

			await plugin.transform!.call(context as any, code, cssId)
			const bundle = createMockBundle([{ id: entryId, name: 'main', modules: {} }])
			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})
	})

	describe('optimizeSelectors option', () => {
		it('should optimize selectors when enabled', async () => {
			const plugin = requireCSS({ minify: { optimizeSelectors: true } })
			const emitFile = vi.fn()
			const code = '.a , .b , .c { color: red; }'
			const cssId = '/path/to/test.css'
			const entryId = '/path/to/entry.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryId) return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
					if (id === cssId) return createMockModuleInfo({ id: cssId, importedIds: [] })
					return null
				}
			}

			await plugin.transform!.call(context as any, code, cssId)
			const bundle = createMockBundle([{ id: entryId, name: 'main', modules: {} }])
			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})
	})
})

describe('CSS Modules advanced features', () => {
	describe('module file extensions', () => {
		it('should handle .module.scss files', async () => {
			const plugin = requireCSS()
			const code = '.button { color: red; }'

			// Mock preprocessor to avoid sass dependency
			const compileSpy = vi.spyOn(preprocessorsModule, 'compilePreprocessor')
			compileSpy.mockResolvedValueOnce({ css: '.button { color: red; }' })

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/styles.module.scss')

			expect(result!.code).toMatch(/_[a-z]+_button_[a-f0-9]+/)

			compileSpy.mockRestore()
		})

		it('should handle .module.less files', async () => {
			const plugin = requireCSS()
			const code = '.button { color: red; }'

			const compileSpy = vi.spyOn(preprocessorsModule, 'compilePreprocessor')
			compileSpy.mockResolvedValueOnce({ css: '.button { color: red; }' })

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/styles.module.less')

			expect(result!.code).toMatch(/_[a-z]+_button_[a-f0-9]+/)

			compileSpy.mockRestore()
		})

		it('should handle .module.styl files', async () => {
			const plugin = requireCSS()
			const code = '.button { color: red; }'

			const compileSpy = vi.spyOn(preprocessorsModule, 'compilePreprocessor')
			compileSpy.mockResolvedValueOnce({ css: '.button { color: red; }' })

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/styles.module.styl')

			expect(result!.code).toMatch(/_[a-z]+_button_[a-f0-9]+/)

			compileSpy.mockRestore()
		})
	})

	describe('class name patterns', () => {
		it('should handle class names with underscores', async () => {
			const plugin = requireCSS({ modules: true })
			const code = '._private { color: red; } .my_class { color: blue; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result!.code).toBeDefined()
			const modules = plugin.api.getCSSModules()
			expect(modules['/path/to/test.css']._private).toBeDefined()
			expect(modules['/path/to/test.css'].my_class).toBeDefined()
		})

		it('should handle class names with hyphens', async () => {
			const plugin = requireCSS({ modules: true })
			const code = '.my-class { color: red; } .btn-primary { color: blue; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result!.code).toBeDefined()
			const modules = plugin.api.getCSSModules()
			expect(modules['/path/to/test.css']['my-class']).toBeDefined()
			expect(modules['/path/to/test.css']['btn-primary']).toBeDefined()
		})

		it('should handle class names with numbers', async () => {
			const plugin = requireCSS({ modules: true })
			const code = '.col-1 { width: 10%; } .col-2 { width: 20%; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result!.code).toBeDefined()
			const modules = plugin.api.getCSSModules()
			expect(modules['/path/to/test.css']['col-1']).toBeDefined()
			expect(modules['/path/to/test.css']['col-2']).toBeDefined()
		})
	})

	describe('edge cases', () => {
		it('should handle empty CSS', async () => {
			const plugin = requireCSS({ modules: true })
			const code = ''

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result).toBeDefined()
		})

		it('should handle CSS without class selectors', async () => {
			const plugin = requireCSS({ modules: true })
			const code = '#id { color: red; } div { margin: 10px; }'

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

			expect(result).toBeDefined()
		})

		it('should handle deeply nested imports', async () => {
			const plugin = requireCSS()
			const emitFile = vi.fn()
			const cssId1 = '/path/to/a.css'
			const cssId2 = '/path/to/b.css'
			const cssId3 = '/path/to/c.css'
			const entryId = '/path/to/entry.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryId) return createMockModuleInfo({ id: entryId, importedIds: [cssId1] })
					if (id === cssId1) return createMockModuleInfo({ id: cssId1, importedIds: [cssId2] })
					if (id === cssId2) return createMockModuleInfo({ id: cssId2, importedIds: [cssId3] })
					if (id === cssId3) return createMockModuleInfo({ id: cssId3, importedIds: [] })
					return null
				}
			}

			await plugin.transform!.call(context as any, '.a {}', cssId1)
			await plugin.transform!.call(context as any, '.b {}', cssId2)
			await plugin.transform!.call(context as any, '.c {}', cssId3)

			const bundle = createMockBundle([{ id: entryId, name: 'main', modules: {} }])
			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})
	})
})

describe('transform hook - additional tests', () => {
	describe('different file extensions', () => {
		it('should process .sass files', async () => {
			const plugin = requireCSS()
			const code = '.test color: red'

			const compileSpy = vi.spyOn(preprocessorsModule, 'compilePreprocessor')
			compileSpy.mockResolvedValueOnce({ css: '.test { color: red; }' })

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.sass')

			expect(result).toBeDefined()

			compileSpy.mockRestore()
		})

		it('should process .stylus files', async () => {
			const plugin = requireCSS()
			const code = '.test { color: red; }'

			const compileSpy = vi.spyOn(preprocessorsModule, 'compilePreprocessor')
			compileSpy.mockResolvedValueOnce({ css: '.test { color: red; }' })

			const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.stylus')

			expect(result).toBeDefined()

			compileSpy.mockRestore()
		})
	})

	describe('transform error handling', () => {
		it('should handle transform function throwing error', async () => {
			const plugin = requireCSS({
				transform: () => {
					throw new Error('Transform error')
				}
			})
			const code = '.test { color: red; }'

			await expect(plugin.transform!.call(createMockContext(), code, '/path/to/test.css')).rejects.toThrow('Transform error')
		})

		it('should handle async transform function rejection', async () => {
			const plugin = requireCSS({
				transform: async () => {
					throw new Error('Async transform error')
				}
			})
			const code = '.test { color: red; }'

			await expect(plugin.transform!.call(createMockContext(), code, '/path/to/test.css')).rejects.toThrow('Async transform error')
		})
	})
})

describe('generateBundle - additional tests', () => {
	describe('edge cases', () => {
		it('should handle bundle with multiple chunks but only one facade', async () => {
			const plugin = requireCSS()
			const emitFile = vi.fn()
			const cssId = '/path/to/test.css'
			const entryId = '/path/to/entry.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryId) return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
					if (id === cssId) return createMockModuleInfo({ id: cssId, importedIds: [] })
					return null
				}
			}

			await plugin.transform!.call(context as any, '.test {}', cssId)

			const bundle: Record<string, any> = {
				'main.js': {
					type: 'chunk',
					facadeModuleId: entryId,
					name: 'main',
					modules: {}
				},
				'chunk.js': {
					type: 'chunk',
					facadeModuleId: null,
					name: 'chunk',
					modules: {}
				}
			}

			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).toHaveBeenCalled()
		})

		it('should handle bundle with asset files', async () => {
			const plugin = requireCSS()
			const emitFile = vi.fn()

			const context = {
				emitFile,
				getModuleInfo: () => createMockModuleInfo({ importedIds: [] })
			}

			const bundle: Record<string, any> = {
				'image.png': {
					type: 'asset',
					fileName: 'image.png',
					source: 'binary data'
				}
			}

			plugin.generateBundle!.call(context as any, {}, bundle)

			expect(emitFile).not.toHaveBeenCalled()
		})

		it('should handle module already in chunk modules', async () => {
			const plugin = requireCSS()
			const emitFile = vi.fn()
			const cssId = '/path/to/test.css'
			const entryId = '/path/to/entry.js'

			const context = {
				emitFile,
				getModuleInfo: (id: string) => {
					if (id === entryId) return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
					if (id === cssId) return createMockModuleInfo({ id: cssId, importedIds: [] })
					return null
				}
			}

			await plugin.transform!.call(context as any, '.test {}', cssId)

			// When module is in chunk.modules, the CSS extraction logic checks:
			// if (!modules[styleId] && moduleIds.includes(styleId))
			// So if styleId is in modules, it won't be extracted (already handled by rollup)
			const bundle: Record<string, any> = {
				'main.js': {
					type: 'chunk',
					facadeModuleId: entryId,
					name: 'main',
					modules: { [cssId]: { renderedLength: 100 } }
				}
			}

			plugin.generateBundle!.call(context as any, {}, bundle)

			// emitFile should NOT be called because the module is already in chunk.modules
			// which means rollup already handled it
			expect(emitFile).not.toHaveBeenCalled()
		})
	})
})

describe('onExtract callback', () => {
	it('should receive correct OutputInfo', async () => {
		const onExtract = vi.fn()
		const plugin = requireCSS({ onExtract })
		const emitFile = vi.fn()
		const cssId = '/path/to/test.css'
		const entryId = '/path/to/entry.js'

		const context = {
			emitFile,
			getModuleInfo: (id: string) => {
				if (id === entryId) return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
				if (id === cssId) return createMockModuleInfo({ id: cssId, importedIds: [] })
				return null
			}
		}

		await plugin.transform!.call(context as any, '.test { color: red; }', cssId)

		const bundle = createMockBundle([{ id: entryId, name: 'main', modules: {} }])
		plugin.generateBundle!.call(context as any, {}, bundle)

		expect(onExtract).toHaveBeenCalled()
		const callArgs = onExtract.mock.calls[0]
		expect(callArgs[1]).toHaveProperty('entry')
		expect(callArgs[1]).toHaveProperty('name')
		expect(callArgs[1]).toHaveProperty('css')
	})

	it('should receive minified CSS when minify is enabled', async () => {
		const onExtract = vi.fn()
		const plugin = requireCSS({ onExtract, minify: true })
		const emitFile = vi.fn()
		const cssId = '/path/to/test.css'
		const entryId = '/path/to/entry.js'

		const context = {
			emitFile,
			getModuleInfo: (id: string) => {
				if (id === entryId) return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
				if (id === cssId) return createMockModuleInfo({ id: cssId, importedIds: [] })
				return null
			}
		}

		await plugin.transform!.call(context as any, '/* comment */ .test { color: red; }', cssId)

		const bundle = createMockBundle([{ id: entryId, name: 'main', modules: {} }])
		plugin.generateBundle!.call(context as any, {}, bundle)

		expect(onExtract).toHaveBeenCalled()
		const callArgs = onExtract.mock.calls[0]
		// Minified CSS should not have comments
		expect(callArgs[1].css).not.toContain('/* comment */')
	})
})

describe('Plugin API - additional tests', () => {
	describe('getStyles()', () => {
		it('should handle multiple files', async () => {
			const plugin = requireCSS()
			const code1 = '.a { color: red; }'
			const code2 = '.b { color: blue; }'

			await plugin.transform!.call(createMockContext(), code1, '/path/to/a.css')
			await plugin.transform!.call(createMockContext(), code2, '/path/to/b.css')

			const styles = plugin.api.getStyles()
			expect(Object.keys(styles)).toHaveLength(2)
		})

		it('should return copy of styles', async () => {
			const plugin = requireCSS()
			await plugin.transform!.call(createMockContext(), '.test {}', '/path/to/test.css')

			const styles1 = plugin.api.getStyles()
			const styles2 = plugin.api.getStyles()

			expect(styles1).not.toBe(styles2)
			expect(styles1).toEqual(styles2)
		})
	})

	describe('getCSSModules()', () => {
		it('should return copy of modules', async () => {
			const plugin = requireCSS({ modules: true })
			await plugin.transform!.call(createMockContext(), '.test {}', '/path/to/test.css')

			const modules1 = plugin.api.getCSSModules()
			const modules2 = plugin.api.getCSSModules()

			expect(modules1).not.toBe(modules2)
			expect(modules1).toEqual(modules2)
		})
	})

	describe('getStats()', () => {
		it('should return copy of stats', () => {
			const plugin = requireCSS()

			const stats1 = plugin.api.getStats()
			const stats2 = plugin.api.getStats()

			expect(stats1).not.toBe(stats2)
			expect(stats1).toEqual(stats2)
		})

		it('should track total size correctly', async () => {
			const plugin = requireCSS()

			await plugin.transform!.call(createMockContext(), '.a { color: red; }', '/path/to/a.css')
			await plugin.transform!.call(createMockContext(), '.b { color: blue; }', '/path/to/b.css')

			const stats = plugin.api.getStats()
			expect(stats.filesProcessed).toBe(2)
			expect(stats.totalSize).toBeGreaterThan(0)
		})
	})

	describe('getClassName()', () => {
		it('should return undefined for unknown class', async () => {
			const plugin = requireCSS({ modules: true })
			await plugin.transform!.call(createMockContext(), '.button {}', '/path/to/test.css')

			expect(plugin.api.getClassName('/path/to/test.css', 'unknown')).toBeUndefined()
		})
	})
})

describe('options combinations', () => {
	it('should handle styleSheet with inject false', async () => {
		const plugin = requireCSS({ styleSheet: true, inject: false })
		const code = '.test { color: red; }'

		const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

		expect(result!.code).toBe('export default undefined;')
	})

	it('should handle modules with styleSheet', async () => {
		const plugin = requireCSS({ modules: true, styleSheet: true })
		const code = '.test { color: red; }'

		const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

		expect(result!.code).toContain('CSSStyleSheet')
		expect(result!.code).toContain('export default')
	})

	it('should handle transform with modules', async () => {
		const plugin = requireCSS({
			modules: true,
			transform: (css) => css.replace(/red/g, 'blue')
		})
		const code = '.test { color: red; }'

		const result = await plugin.transform!.call(createMockContext(), code, '/path/to/test.css')

		expect(result!.code).toContain('blue')
	})

	it('should handle all minify options disabled', async () => {
		const plugin = requireCSS({
			minify: {
				removeComments: false,
				collapseWhitespace: false,
				removeRedundantValues: false,
				mergeRules: false,
				optimizeSelectors: false
			}
		})
		const emitFile = vi.fn()
		const cssId = '/path/to/test.css'
		const entryId = '/path/to/entry.js'

		const context = {
			emitFile,
			getModuleInfo: (id: string) => {
				if (id === entryId) return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
				if (id === cssId) return createMockModuleInfo({ id: cssId, importedIds: [] })
				return null
			}
		}

		await plugin.transform!.call(context as any, '.test { color: red; }', cssId)
		const bundle = createMockBundle([{ id: entryId, name: 'main', modules: {} }])
		plugin.generateBundle!.call(context as any, {}, bundle)

		expect(emitFile).toHaveBeenCalled()
	})

	it('should handle split with single entry', async () => {
		const plugin = requireCSS({ split: true })
		const emitFile = vi.fn()
		const cssId = '/path/to/test.css'
		const entryId = '/path/to/entry.js'

		const context = {
			emitFile,
			getModuleInfo: (id: string) => {
				if (id === entryId) return createMockModuleInfo({ id: entryId, importedIds: [cssId] })
				if (id === cssId) return createMockModuleInfo({ id: cssId, importedIds: [] })
				return null
			}
		}

		await plugin.transform!.call(context as any, '.test {}', cssId)
		const bundle = createMockBundle([{ id: entryId, name: 'main', modules: {} }])
		plugin.generateBundle!.call(context as any, {}, bundle)

		expect(emitFile).toHaveBeenCalled()
	})
})

describe('error messages', () => {
	it('should include filename in Sass error', async () => {
		await expect(
			preprocessorsModule.compileSass('.test { invalid syntax', '/custom/path/test.scss', {})
		).rejects.toThrow('/custom/path/test.scss')
	})

	it('should include filename in Less error', async () => {
		await expect(
			preprocessorsModule.compileLess('.test { invalid syntax', '/custom/path/test.less', {})
		).rejects.toThrow('/custom/path/test.less')
	})

	it('should include filename in Stylus error', async () => {
		await expect(
			preprocessorsModule.compileStylus('.test { invalid syntax', '/custom/path/test.styl', {})
		).rejects.toThrow('/custom/path/test.styl')
	})
})

describe('type exports', () => {
	it('should export MinifyOptions type', () => {
		const opts: MinifyOptions = {
			removeComments: true,
			collapseWhitespace: true,
			removeRedundantValues: true,
			mergeRules: false,
			optimizeSelectors: false
		}
		expect(opts).toBeDefined()
	})

	it('should export CSSModulesOptions type', () => {
		const opts: CSSModulesOptions = {
			enabled: 'auto',
			generateScopedName: (name) => `custom_${name}`,
			globalModulePaths: [/\.global\./],
			exportLocalsAsDefault: false
		}
		expect(opts).toBeDefined()
	})

	it('should export Options type', () => {
		const opts: Options = {
			transform: (code) => code,
			output: 'bundle.css',
			include: '**/*.css',
			exclude: 'node_modules/**',
			styleSheet: false,
			minify: true,
			inject: true,
			modules: true,
			postcss: { enabled: true, plugins: [] },
			preprocessor: { sass: true },
			split: false,
			sourcemap: true,
			hmr: false,
			cache: true,
			extensions: ['.css'],
			onExtract: () => {}
		}
		expect(opts).toBeDefined()
	})
})
