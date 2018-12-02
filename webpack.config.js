var path = require("path");
var HtmlWebpackPlugin = require("html-webpack-plugin");
// var BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
// 	.BundleAnalyzerPlugin;

module.exports = {
	context: __dirname,
	entry: "./components/entry.jsx",
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "./dist"),
	},
	resolve: {
		extensions: [".js", ".jsx", "*"],
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /(node_modules)/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-react", "@babel/preset-env"],
						plugins: ["@babel/plugin-proposal-class-properties"],
					},
				},
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: "KeyWheel",
			inject: "head",
		}),
		// new BundleAnalyzerPlugin({
		// 	analyzerMode: "static",
		// }),
	],
	devServer: {
		contentBase: path.join(__dirname, "dist"),
		compress: true,
		port: 3000,
	},
};
