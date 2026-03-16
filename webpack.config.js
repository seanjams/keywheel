const path = require("path");
var HtmlWebpackPlugin = require("html-webpack-plugin");
// var BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
// 	.BundleAnalyzerPlugin;

module.exports = ({ mobile }, { mode }) => ({
    entry: "./src/components/entry.tsx",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
    devtool: mode === "development" ? "eval" : false,
    resolve: {
        // Add '.ts', '.tsx', and '.js' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".jsx"],
    },

    module: {
        rules: [
            {
                test: /.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader",
                    },
                ],
            },
            {
                test: /\.css$/,
                // include: /node_modules/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(png|svg|jpg|jpeg)$/i,
                loader: "file-loader",
                options: {
                    name: "assets/icons/[name].[ext]",
                },
            },
            {
                test: /\.(mp3|wav|ogg)$/i,
                loader: "file-loader",
                options: {
                    name: "assets/audio/[name].[ext]",
                },
            },
            {
                test: /\.mp4$/i,
                loader: "file-loader",
                options: {
                    name: "assets/video/[name].[ext]",
                },
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                loader: "file-loader",
                options: {
                    name: "assets/fonts/[name].[ext]",
                },
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
        static: path.join(__dirname, "./src"),
        compress: true,
        port: 3000,
    },
});
