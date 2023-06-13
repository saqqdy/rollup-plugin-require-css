module.exports = {
	presets: [
		[
			'@babel/env',
			{
				modules: 'auto',
				corejs: 3,
				useBuiltIns: 'usage',
				targets: {
					node: '12.20'
				}
			}
		],
		'@babel/typescript'
	]
}
