import { basename, extname } from 'path'
import type { GetModuleInfo, OutputChunk, Plugin, RenderedModule } from 'rollup'
import { createFilter } from '@rollup/pluginutils'

export interface Options {
	/**
	 * The transform function is used for processing the CSS, it receives a string containing the code to process as an argument. The function should return a string.
	 */
	transform?: (code: string) => string
	/**
	 * An output file name for the css bundle.
	 */
	output?: string
	/**
	 * A single file, or array of files to include when minifying.
	 */
	include?: string | string[]
	/**
	 * A single file, or array of files to exclude when minifying.
	 */
	exclude?: string | string[]
	/**
	 * All css files being imported with a variable will use native CSS Modules.
	 */
	styleSheet?: boolean
}

/**
 * A rollup plugin for import css
 *
 * @param options - options
 * @returns Plugin - requireCss plugin
 */
function requireCss(options: Options): Plugin {
	const styles: Record<string, any> = {}
	const filter = createFilter(options.include ?? ['**/*.css'], options.exclude ?? [])

	/* function to sort the css imports in order - credit to rollup-plugin-postcss */
	const getRecursiveImportOrder = (
		id: string,
		getModuleInfo: GetModuleInfo,
		seen = new Set()
	) => {
		if (seen.has(id)) return []
		seen.add(id)

		const result = [id]
		const moduleInfo = getModuleInfo(id)
		if (moduleInfo) {
			moduleInfo.importedIds.forEach((importFile: string) => {
				result.push(...getRecursiveImportOrder(importFile, getModuleInfo, seen))
			})
		}

		return result
	}

	return {
		name: 'require-css',
		transform(code, id) {
			if (!filter(id)) return

			const transformedCode = code

			// custom transform
			if (options.transform) options.transform(code)

			// cache works
			if (!styles[id] || styles[id] !== transformedCode) {
				styles[id] = transformedCode
			}

			const moduleInfo = this.getModuleInfo(id)

			if (options.styleSheet || moduleInfo?.assertions?.type === 'css') {
				return {
					code: `const stylesheet = new CSSStyleSheet();stylesheet.replaceSync(${JSON.stringify(
						transformedCode
					)});document.adoptedStyleSheets = [stylesheet];export default stylesheet;`,
					map: { mappings: '' }
				}
			}
			return {
				code: `import mountStyle from 'mount-style';const css = ${JSON.stringify(
					transformedCode
				)};mountStyle(css);export default css;`,
				map: { mappings: '' }
			}
		},
		// output a css file with all css that was imported without being assigned a variable
		generateBundle(opts, bundle) {
			// collect all the imported modules for each entry file
			let modules: Record<string, RenderedModule> = {},
				entryChunk = ''
			for (const id in bundle) {
				const file = bundle[id] as OutputChunk
				modules = Object.assign(modules, file.modules)
				if (!entryChunk && file.facadeModuleId) entryChunk = file.facadeModuleId
			}

			// get the list of modules in order
			const moduleIds = getRecursiveImportOrder(entryChunk, this.getModuleInfo)

			// remove css that was imported as a string
			const unInjectStyles: string[] = []
			Object.entries(styles)
				.sort((a, b) => moduleIds.indexOf(a[0]) - moduleIds.indexOf(b[0]))
				.forEach(([id, code]: [string, string]) => {
					if (!modules[id]) unInjectStyles.push(code)
				})
			const css = unInjectStyles.join('\n')

			if (css.trim().length === 0) return

			const filename = options.output ?? opts.file ?? 'index.js'

			const dest = basename(filename, extname(filename))
			this.emitFile({ type: 'asset', fileName: `${dest}.css`, source: css })
		}
	}
}

export default requireCss
