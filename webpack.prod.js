var path = require("path");
var common = require("./webpack.config.js");
var webpack = require("webpack");
var merge = require("webpack-merge");
const CompressionPlugin = require("compression-webpack-plugin");
// var BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
// 	.BundleAnalyzerPlugin;

module.exports = merge(common, {
	mode: "production",
	// plugins: [
	// 	new CompressionPlugin({
	// 		filename: "[path]",
	// 	}),
	// ],
});
