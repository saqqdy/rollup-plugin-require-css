import type { GetModuleInfo, OutputChunk, Plugin, RenderedModule, SourceMapInput } from 'rollup'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { createFilter } from '@rollup/pluginutils'
import pkg from '../package.json' with { type: 'json' }
import { processPostCSS } from './postcss'
import { compilePreprocessor, detectPreprocessor } from './preprocessors'

// ============================================================================
// Types
// ============================================================================

export interface MinifyOptions {
	/** Remove comments (default: true) */
	removeComments?: boolean
	/** Collapse whitespace (default: true) */
	collapseWhitespace?: boolean
	/** Remove redundant values (default: true) */
	removeRedundantValues?: boolean
	/** Merge adjacent rules (default: false) */
	mergeRules?: boolean
	/** Optimize selectors (default: false) */
	optimizeSelectors?: boolean
}

export interface PostCSSOptions {
	/** PostCSS plugins to use */
	plugins?: any[]
	/** PostCSS options */
	options?: Record<string, any>
	/** Enable PostCSS (default: false) */
	enabled?: boolean
}

export interface PreprocessorOptions {
	/** Enable Sass/SCSS support */
	sass?: boolean | SassOptions
	/** Enable Less support */
	less?: boolean | LessOptions
	/** Enable Stylus support */
	stylus?: boolean | StylusOptions
}

export interface SassOptions {
	/** Include paths for Sass */
	includePaths?: string[]
	/** Enable quietDeps flag */
	quietDeps?: boolean
	/** Additional options */
	options?: Record<string, any>
}

export interface LessOptions {
	/** Include paths for Less */
	paths?: string[]
	/** Additional options */
	options?: Record<string, any>
}

export interface StylusOptions {
	/** Include paths for Stylus */
	paths?: string[]
	/** Additional options */
	options?: Record<string, any>
}

export interface CSSModulesOptions {
	/** Enable CSS Modules (default: auto-detect .module.css) */
	enabled?: boolean | 'auto'
	/** Generate scoped class names */
	generateScopedName?: (name: string, filename: string, css: string) => string
	/** Global module behavior */
	globalModulePaths?: (string | RegExp)[]
	/** Export locals as default export */
	exportLocalsAsDefault?: boolean
}

export interface CacheOptions {
	/** Enable cache (default: true in watch mode) */
	enabled?: boolean
	/** Cache directory (default: node_modules/.cache/rollup-plugin-require-css) */
	dir?: string
	/** Cache TTL in milliseconds (default: 24 hours) */
	ttl?: number
}

export interface Options {
	/** The transform function is used for processing the CSS */
	transform?: (code: string, id: string) => string | Promise<string>
	/** An output file name for the CSS bundle */
	output?: string | ((chunk: OutputInfo) => string)
	/** A single file, or array of files to include */
	include?: string | string[]
	/** A single file, or array of files to exclude */
	exclude?: string | string[]
	/** Use CSSStyleSheet for Shadow DOM support */
	styleSheet?: boolean
	/** Minify the CSS output. Can be boolean or object with options */
	minify?: boolean | MinifyOptions
	/** Inject CSS into the bundle or extract to a separate file */
	inject?: boolean
	/** CSS Modules configuration */
	modules?: boolean | CSSModulesOptions
	/** PostCSS configuration */
	postcss?: PostCSSOptions
	/** Preprocessor configuration (Sass, Less, Stylus). Set to `false` to disable */
	preprocessor?: PreprocessorOptions | false
	/** Enable CSS code splitting for multiple entry points */
	split?: boolean
	/** Generate source maps for CSS */
	sourcemap?: boolean | 'inline' | 'external'
	/** Enable HMR (Hot Module Replacement) support */
	hmr?: boolean
	/** Cache configuration */
	cache?: boolean | CacheOptions
	/** Custom file extensions to process */
	extensions?: string[]
	/** Callback when CSS is extracted */
	onExtract?: (css: string, chunk: OutputInfo) => void
}

export interface OutputInfo {
	/** Entry file name */
	entry: string
	/** Output file name (without extension) */
	name: string
	/** CSS content */
	css: string
	/** Source map */
	map?: SourceMapInput | undefined
}

export interface PluginApi {
	/** Get all collected styles */
	getStyles: () => Record<string, string>
	/** Get CSS modules class name mappings */
	getCSSModules: () => Record<string, Record<string, string>>
	/** Get CSS module class name by original name */
	getClassName: (filename: string, className: string) => string | undefined
	/** Clear the cache */
	clearCache: () => void
	/** Get plugin statistics */
	getStats: () => PluginStats
}

export interface PluginStats {
	/** Number of files processed */
	filesProcessed: number
	/** Total CSS size in bytes */
	totalSize: number
	/** Cache hits */
	cacheHits: number
	/** Cache misses */
	cacheMisses: number
}

// ============================================================================
// Constants
// ============================================================================

const PACKAGE_VERSION = pkg.version
const DEFAULT_EXTENSIONS = ['.css', '.scss', '.sass', '.less', '.styl', '.stylus']
const MODULE_EXTENSIONS = ['.module.css', '.module.scss', '.module.sass', '.module.less', '.module.styl']
const EMPTY_SOURCEMAP = { version: 3, mappings: '', sources: [], names: [] } as const

// ============================================================================
// Utility Functions
// ============================================================================

function generateHash(content: string, length = 5): string {
	return createHash('md5').update(content).digest('hex').slice(0, length)
}

function generateScopedClassName(name: string, filename: string, css: string): string {
	const hash = generateHash(css, 5)
	const baseName = basename(filename).replace(/\.(module\.)?(css|scss|sass|less|styl|stylus)$/, '')
	return `_${baseName}_${name}_${hash}`
}

function isCSSModuleFile(id: string): boolean {
	return MODULE_EXTENSIONS.some(ext => id.endsWith(ext))
}

function shouldUseCSSModules(id: string, options: CSSModulesOptions | boolean): boolean {
	if (options === true) return true
	if (options === false) return false
	if (options.enabled === 'auto' || options.enabled === undefined) {
		return isCSSModuleFile(id)
	}
	return options.enabled === true
}

function minifyCSS(css: string, options: MinifyOptions = {}): string {
	const {
		removeComments = true,
		collapseWhitespace = true,
		removeRedundantValues = true,
		mergeRules = false,
		optimizeSelectors = false
	} = options

	let result = css

	if (removeComments) {
		result = result.replace(/\/\*[\s\S]*?\*\//g, '')
	}

	if (collapseWhitespace) {
		result = result
			.replace(/\s+/g, ' ')
			.replace(/\s*([{}:;,>+~])\s*/g, '$1')
			.replace(/;}/g, '}')
			.trim()
	}

	if (removeRedundantValues) {
		result = result
			.replace(/:\s*0px\b/g, ': 0')
			.replace(/:\s*0em\b/g, ': 0')
			.replace(/:\s*0rem\b/g, ': 0')
			.replace(/:\s*0%/g, ': 0')
	}

	if (mergeRules) {
		result = result.replace(/}\s*([^{}]+)\s*{/g, '}\n$1{')
	}

	if (optimizeSelectors) {
		result = result.replace(/\s*,\s*/g, ',')
	}

	return result.trim()
}

function transformCSSModules(
	css: string,
	filename: string,
	options: CSSModulesOptions
): { css: string; classes: Record<string, string> } {
	const classes: Record<string, string> = {}
	const generateName = options.generateScopedName ?? generateScopedClassName

	const transformedCSS = css.replace(/\.([a-zA-Z_][\w-]*)/g, (_match, className) => {
		const scopedName = generateName(className, filename, css)
		classes[className] = scopedName
		return `.${scopedName}`
	})

	return { css: transformedCSS, classes }
}

function generateSourceMap(
	css: string,
	filename: string,
	sourceContent: string,
	sourceRoot?: string
): SourceMapInput {
	const lines = css.split('\n')
	const sourceLines = sourceContent.split('\n')
	const mappings: string[] = []

	for (let i = 0; i < lines.length; i++) {
		mappings.push(i < sourceLines.length ? 'AAAA' : '')
	}

	return {
		version: 3,
		file: filename,
		sourceRoot: sourceRoot ?? '',
		sources: [filename],
		sourcesContent: [sourceContent],
		names: [],
		mappings: mappings.join(';')
	}
}

function getRecursiveImportOrder(
	id: string,
	getModuleInfo: GetModuleInfo,
	seen = new Set<string>()
): string[] {
	if (seen.has(id)) return []
	seen.add(id)

	const result = [id]
	const moduleInfo = getModuleInfo(id)
	if (moduleInfo) {
		for (const importedId of moduleInfo.importedIds) {
			result.push(...getRecursiveImportOrder(importedId, getModuleInfo, seen))
		}
	}

	return result
}

// ============================================================================
// Cache Implementation
// ============================================================================

class FileCache {
	private cache = new Map<string, { content: string; timestamp: number; mtime: number }>()
	private readonly dir: string
	private readonly ttl: number
	hits = 0
	misses = 0

	constructor(dir: string, ttl: number) {
		this.dir = dir
		this.ttl = ttl
		this.load()
	}

	private load(): void {
		try {
			const cacheFile = join(this.dir, 'cache.json')
			if (existsSync(cacheFile)) {
				const data = JSON.parse(readFileSync(cacheFile, 'utf-8'))
				for (const [key, value] of Object.entries(data)) {
					this.cache.set(key, value as { content: string; timestamp: number; mtime: number })
				}
			}
		} catch {
			// Ignore cache load errors
		}
	}

	private save(): void {
		try {
			mkdirSync(this.dir, { recursive: true })
			const cacheFile = join(this.dir, 'cache.json')
			const data: Record<string, unknown> = {}
			this.cache.forEach((value, key) => {
				data[key] = value
			})
			writeFileSync(cacheFile, JSON.stringify(data))
		} catch {
			// Ignore cache save errors
		}
	}

	get(key: string): string | undefined {
		const entry = this.cache.get(key)
		if (entry && Date.now() - entry.timestamp < this.ttl) {
			this.hits++
			return entry.content
		}
		if (entry) {
			this.cache.delete(key)
		}
		this.misses++
		return undefined
	}

	set(key: string, content: string, mtime: number): void {
		this.cache.set(key, { content, timestamp: Date.now(), mtime })
		this.save()
	}

	clear(): void {
		this.cache.clear()
		try {
			rmSync(this.dir, { recursive: true })
		} catch {
			// Ignore clear errors
		}
	}
}

// ============================================================================
// Main Plugin
// ============================================================================

/**
 * A rollup plugin for importing CSS
 */
export default function requireCSS(options: Options = {}): Plugin {
	const styles = new Map<string, string>()
	const cssModules: Record<string, Record<string, string>> = {}
	const stats: PluginStats = { filesProcessed: 0, totalSize: 0, cacheHits: 0, cacheMisses: 0 }

	// Cache setup
	const cache = (typeof options.cache === 'boolean' ? options.cache : options.cache?.enabled)
		? new FileCache(
			typeof options.cache === 'object'
				? options.cache.dir ?? join(process.cwd(), 'node_modules', '.cache', 'rollup-plugin-require-css')
				: join(process.cwd(), 'node_modules', '.cache', 'rollup-plugin-require-css'),
			typeof options.cache === 'object' ? options.cache.ttl ?? 86400000 : 86400000
		)
		: undefined

	// Filter setup
	const extensions = options.extensions ?? DEFAULT_EXTENSIONS
	const filter = createFilter(
		options.include ?? extensions.map(ext => `**/*${ext}`),
		options.exclude ?? []
	)

	async function processCSS(code: string, id: string): Promise<{
		css: string
		classes: Record<string, string> | undefined
		map: SourceMapInput | undefined
	}> {
		let processedCSS = code,
			sourceMap: any,
			classes: Record<string, string> | undefined

		// Step 1: Compile preprocessors
		if (detectPreprocessor(id) && options.preprocessor !== false) {
			const compiled = await compilePreprocessor(processedCSS, id, options.preprocessor ?? {})
			processedCSS = compiled.css
			sourceMap = compiled.map
		}

		// Step 2: Apply PostCSS
		if (options.postcss?.enabled || (options.postcss?.plugins?.length ?? 0) > 0) {
			const postcssResult = await processPostCSS(processedCSS, id, options.postcss)
			processedCSS = postcssResult.css
			if (postcssResult.map) sourceMap = postcssResult.map
		}

		// Step 3: Apply custom transform
		if (options.transform) {
			processedCSS = await options.transform(processedCSS, id)
		}

		// Step 4: CSS Modules transformation
		const modulesConfig = options.modules ?? { enabled: 'auto' }
		if (shouldUseCSSModules(id, modulesConfig)) {
			const modulesOpts = typeof modulesConfig === 'object' ? modulesConfig : {}
			const result = transformCSSModules(processedCSS, id, modulesOpts)
			processedCSS = result.css
			classes = result.classes
			cssModules[id] = classes
		}

		// Step 5: Generate source map
		const map = options.sourcemap
			? (sourceMap ?? generateSourceMap(processedCSS, id, code))
			: undefined

		return { css: processedCSS, classes, map }
	}

	function generateModuleCode(css: string, classes?: Record<string, string>, isStyleSheet = false): string {
		if (classes) {
			const injectCode = isStyleSheet
				? `const stylesheet = new CSSStyleSheet();stylesheet.replaceSync(${JSON.stringify(css)});document.adoptedStyleSheets = [...document.adoptedStyleSheets, stylesheet];`
				: `import mountStyle from 'mount-style';mountStyle(${JSON.stringify(css)});`
			return `${injectCode}\nexport default ${JSON.stringify(classes)};`
		}

		if (isStyleSheet) {
			return `const stylesheet = new CSSStyleSheet();stylesheet.replaceSync(${JSON.stringify(css)});export default stylesheet;`
		}

		return `import mountStyle from 'mount-style';const css = ${JSON.stringify(css)};mountStyle(css);export default css;`
	}

	function emitCSSAsset(
		context: { emitFile: (options: { type: 'asset'; fileName: string; source: string }) => void },
		css: string,
		baseName: string,
		sourcemapOption?: boolean | 'inline' | 'external'
	): void {
		const map = sourcemapOption && sourcemapOption !== 'inline'
			? generateSourceMap(css, `${baseName}.css`, css)
			: undefined

		const source = map && sourcemapOption === 'external'
			? css
			: (map ? `${css}\n/*# sourceMappingURL=${baseName}.css.map */` : css)

		context.emitFile({ type: 'asset', fileName: `${baseName}.css`, source })

		if (map && sourcemapOption === 'external') {
			context.emitFile({ type: 'asset', fileName: `${baseName}.css.map`, source: JSON.stringify(map) })
		}
	}

	// Plugin API
	const api: PluginApi = {
		getStyles: () => Object.fromEntries(styles),
		getCSSModules: () => ({ ...cssModules }),
		getClassName: (filename: string, className: string) => cssModules[filename]?.[className],
		clearCache: () => cache?.clear(),
		getStats: () => ({ ...stats, cacheHits: cache?.hits ?? 0, cacheMisses: cache?.misses ?? 0 })
	}

	return {
		name: 'require-css',
		version: PACKAGE_VERSION,

		async transform(code, id) {
			if (!filter(id)) return null

			// Check cache
			if (cache) {
				const cached = cache.get(id)
				if (cached) {
					styles.set(id, cached)
					stats.cacheHits++

					if (options.inject === false) {
						return { code: 'export default undefined;', map: EMPTY_SOURCEMAP }
					}

					const cachedClasses = cssModules[id]
					if (cachedClasses) {
						return { code: `export default ${JSON.stringify(cachedClasses)};`, map: EMPTY_SOURCEMAP }
					}

					return { code: `const css = ${JSON.stringify(cached)};export default css;`, map: EMPTY_SOURCEMAP }
				}
				stats.cacheMisses++
			}

			// Process CSS
			const processed = await processCSS(code, id)
			styles.set(id, processed.css)
			stats.filesProcessed++
			stats.totalSize += processed.css.length

			// Cache result
			if (cache) {
				try {
					cache.set(id, processed.css, statSync(id).mtimeMs)
				} catch {
					// Ignore stat errors
				}
			}

			// If inject is false, only extract CSS to file
			if (options.inject === false) {
				return { code: 'export default undefined;', map: EMPTY_SOURCEMAP }
			}

			const moduleInfo = this.getModuleInfo(id)
			const isStyleSheet = options.styleSheet || (moduleInfo as any)?.attributes?.type === 'css'

			return {
				code: generateModuleCode(processed.css, processed.classes, isStyleSheet),
				map: EMPTY_SOURCEMAP
			}
		},

		generateBundle(outputOptions, bundle) {
			// Collect entry points
			const entries = new Map<string, { modules: Record<string, RenderedModule>; chunk: OutputChunk }>()
			for (const chunk of Object.values(bundle)) {
				if (chunk.type === 'chunk' && chunk.facadeModuleId) {
					entries.set(chunk.facadeModuleId, { modules: { ...chunk.modules }, chunk })
				}
			}

			// Helper to extract CSS for an entry
			const extractCSS = (entryId: string, _modules: Record<string, RenderedModule>): string | null => {
				const moduleIds = getRecursiveImportOrder(entryId, this.getModuleInfo)
				const extractedStyles: string[] = []

				styles.forEach((css, styleId) => {
					if (moduleIds.includes(styleId)) {
						extractedStyles.push(css)
					}
				})

				return extractedStyles.length > 0 ? extractedStyles.join('\n') : null
			}

			// Process entries
			if (options.split && entries.size > 1) {
				entries.forEach(({ modules, chunk }, entryId) => {
					const css = extractCSS(entryId, modules)
					if (!css) return

					const processedCSS = options.minify
						? minifyCSS(css, typeof options.minify === 'object' ? options.minify : {})
						: css

					const outputName = typeof options.output === 'function'
						? options.output({ entry: entryId, name: chunk.name, css: processedCSS })
						: (options.output ?? chunk.name)

					const baseName = typeof outputName === 'string'
						? basename(outputName, extname(outputName))
						: chunk.name

					emitCSSAsset(this, processedCSS, baseName, options.sourcemap)
					options.onExtract?.(processedCSS, { entry: entryId, name: baseName, css: processedCSS })
				})
			} else {
				// Single CSS bundle - find main entry
				let mainEntry = ''
				const allModules: Record<string, RenderedModule> = {}

				for (const chunk of Object.values(bundle)) {
					if (chunk.type === 'chunk') {
						Object.assign(allModules, chunk.modules)
						if (!mainEntry && chunk.facadeModuleId) {
							mainEntry = chunk.facadeModuleId
						}
					}
				}

				const css = extractCSS(mainEntry, allModules)
				if (!css) return

				const processedCSS = options.minify
					? minifyCSS(css, typeof options.minify === 'object' ? options.minify : {})
					: css

				const filename = options.output ?? outputOptions.file ?? 'index.js'
				const baseName = typeof filename === 'string'
					? basename(filename, extname(filename))
					: 'index'

				emitCSSAsset(this, processedCSS, baseName, options.sourcemap)
				options.onExtract?.(processedCSS, { entry: mainEntry, name: baseName, css: processedCSS })
			}
		},

		api,

		resolveId(source, _importer, resolveOptions) {
			if ((resolveOptions as any)?.attributes?.type === 'css') {
				return null
			}
			// Resolve mount-style from user's node_modules (use ESM version for default export)
			if (source === 'mount-style') {
				try {
					return require.resolve('mount-style/dist/index.mjs')
				} catch {
					return { id: 'mount-style', external: true }
				}
			}
			return null
		}
	}
}
