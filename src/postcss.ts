import type { PostCSSOptions } from './index'

export interface PostCSSResult {
	css: string
	map?: any
	messages: any[]
}

/**
 * Process CSS with PostCSS
 */
export async function processPostCSS(
	css: string,
	filename: string,
	options: PostCSSOptions = {}
): Promise<PostCSSResult> {
	if (!options.enabled && (options.plugins?.length ?? 0) === 0) {
		return { css, messages: [] }
	}

	try {
		// Dynamic import for postcss
		const postcss = (await import('postcss')).default

		const plugins = options.plugins ?? []
		const postcssOptions = {
			from: filename,
			...(options.options ?? {}),
			map: options.options?.map ?? {
				inline: false,
				annotation: false
			}
		}

		const result = await postcss(plugins).process(css, postcssOptions)

		return {
			css: result.css,
			map: result.map,
			messages: result.messages
		}
	} catch (error) {
		throw new Error(`[rollup-plugin-require-css] PostCSS processing error in ${filename}: ${error}`)
	}
}

/**
 * Check if PostCSS is available
 */
export async function isPostCSSAvailable(): Promise<boolean> {
	try {
		await import('postcss')
		return true
	} catch {
		return false
	}
}
