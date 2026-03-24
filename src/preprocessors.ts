import type { LessOptions, PreprocessorOptions, SassOptions, StylusOptions } from './index'

export interface PreprocessorResult {
	css: string
	map?: any
}

/**
 * Compile Sass/SCSS to CSS
 */
export async function compileSass(
	code: string,
	filename: string,
	options: SassOptions = {}
): Promise<PreprocessorResult> {
	try {
		// Dynamic import for sass
		const sass = await import('sass')

		const result = await sass.compileStringAsync(code, {
			sourceMap: true,
			sourceMapIncludeSources: true,
			...options.options,
			loadPaths: [
				'node_modules',
				...(options.includePaths ?? [])
			],
			quietDeps: options.quietDeps ?? true,
			silenceDeprecations: ['mixed-decls']
		})

		return {
			css: result.css,
			map: result.sourceMap
		}
	} catch (error) {
		throw new Error(`[rollup-plugin-require-css] Sass compilation error in ${filename}: ${error}`)
	}
}

/**
 * Compile Less to CSS
 */
export async function compileLess(
	code: string,
	filename: string,
	options: LessOptions = {}
): Promise<PreprocessorResult> {
	try {
		// Dynamic import for less
		const less = (await import('less')).default

		const result = await less.render(code, {
			sourceMap: {
				sourceMapFileInline: false
			},
			...options.options,
			paths: [
				'node_modules',
				...(options.paths ?? [])
			],
			filename
		})

		return {
			css: result.css,
			map: result.map
		}
	} catch (error) {
		throw new Error(`[rollup-plugin-require-css] Less compilation error in ${filename}: ${error}`)
	}
}

/**
 * Compile Stylus to CSS
 */
export async function compileStylus(
	code: string,
	filename: string,
	options: StylusOptions = {}
): Promise<PreprocessorResult> {
	try {
		// Dynamic import for stylus
		const stylus = (await import('stylus')).default

		const renderer = stylus(code, {
			filename,
			...options.options,
			paths: [
				'node_modules',
				...(options.paths ?? [])
			]
		})

		// Enable sourcemaps
		renderer.set('sourcemap', {
			comment: false,
			inline: false,
			basePath: '',
			sourceRoot: ''
		})

		const css = renderer.render()
		const map = renderer.sourcemap

		return { css, map }
	} catch (error) {
		throw new Error(`[rollup-plugin-require-css] Stylus compilation error in ${filename}: ${error}`)
	}
}

/**
 * Detect preprocessor from file extension
 */
export function detectPreprocessor(filename: string): 'sass' | 'less' | 'stylus' | null {
	if (filename.endsWith('.scss') || filename.endsWith('.sass')) {
		return 'sass'
	}
	if (filename.endsWith('.less')) {
		return 'less'
	}
	if (filename.endsWith('.styl') || filename.endsWith('.stylus')) {
		return 'stylus'
	}
	return null
}

/**
 * Compile preprocessor code to CSS
 */
export async function compilePreprocessor(
	code: string,
	filename: string,
	options: PreprocessorOptions = {}
): Promise<PreprocessorResult> {
	const preprocessor = detectPreprocessor(filename)

	if (!preprocessor) {
		return { css: code }
	}

	switch (preprocessor) {
		case 'sass': {
			if (options.sass === false) {
				throw new Error(`[rollup-plugin-require-css] Sass support is disabled but file ${filename} requires it`)
			}
			const sassOpts = typeof options.sass === 'object' ? options.sass : {}
			return compileSass(code, filename, sassOpts)
		}

		case 'less': {
			if (options.less === false) {
				throw new Error(`[rollup-plugin-require-css] Less support is disabled but file ${filename} requires it`)
			}
			const lessOpts = typeof options.less === 'object' ? options.less : {}
			return compileLess(code, filename, lessOpts)
		}

		case 'stylus': {
			if (options.stylus === false) {
				throw new Error(`[rollup-plugin-require-css] Stylus support is disabled but file ${filename} requires it`)
			}
			const stylusOpts = typeof options.stylus === 'object' ? options.stylus : {}
			return compileStylus(code, filename, stylusOpts)
		}

		default:
			return { css: code }
	}
}
