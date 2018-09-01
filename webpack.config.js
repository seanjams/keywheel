var path = require("path");

module.exports = {
	context: __dirname,
	entry: "./components/entry.jsx",
	output: {
		filename: "bundle.js",
	},
	resolve: {
		extensions: [".js", ".jsx", "*"],
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				exclude: /(node_modules)/,
				loader: "babel-loader",
				query: {
					presets: ["react", "env", "stage-1"],
				},
			},
		],
	},
	devtool: "source-map",
};
