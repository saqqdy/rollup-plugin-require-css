// Type declarations for optional peer dependencies

declare module 'postcss' {
	interface Postcss {
		process: (css: string, options?: Record<string, any>) => any
		(input: any, options?: Record<string, any>): any
		default: Postcss
	}
	const postcss: Postcss
	export = postcss
}

declare module 'sass' {
	export interface SourceMap {
		version: number
		sources: string[]
		sourcesContent: string[]
		mappings: string
	}

	export interface CompileResult {
		css: string
		sourceMap?: SourceMap
	}

	export interface CompileOptions {
		sourceMap?: boolean
		sourceMapIncludeSources?: boolean
		loadPaths?: string[]
		quietDeps?: boolean
		silenceDeprecations?: string[]
		[key: string]: any
	}

	export function compileStringAsync(
		source: string,
		options?: CompileOptions
	): Promise<CompileResult>
}

declare module 'less' {
	export interface SourceMap {
		version: number
		sources: string[]
		sourcesContent: string[]
		mappings: string
	}

	export interface RenderResult {
		css: string
		map?: SourceMap | string
	}

	export interface RenderOptions {
		sourceMap?: any
		paths?: string[]
		filename?: string
		[key: string]: any
	}

	export interface Less {
		render: (source: string, options?: RenderOptions) => Promise<RenderResult>
		(options?: RenderOptions): any
		default: Less
	}

	const less: Less
	export = less
}

declare module 'stylus' {
	export interface SourceMap {
		version: number
		sources: string[]
		sourcesContent: string[]
		mappings: string
	}

	export interface Renderer {
		render: () => string
		set: (key: string, value: any) => Renderer
		sourcemap?: SourceMap
	}

	export interface StylusOptions {
		filename?: string
		paths?: string[]
		[key: string]: any
	}

	export interface Stylus {
		(source: string, options?: StylusOptions): Renderer
		default: Stylus
	}

	const stylus: Stylus
	export = stylus
}
