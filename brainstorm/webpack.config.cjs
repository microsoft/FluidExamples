/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
	// Basic configuration
	entry: "./src/index.tsx",
	// Necessary in order to use source maps and debug directly TypeScript files
	devtool: "source-map",
	mode: "development",
	performance: {
		maxAssetSize: 4000000,
		maxEntrypointSize: 4000000,
	},
	module: {
		rules: [
			// Necessary in order to use TypeScript
			{
				test: /\.ts$|tsx/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: [
					{
						loader: "style-loader",
					},
					{
						loader: "css-loader",
					},
				],
			},
		],
	},
	resolve: {
		extensionAlias: {
			".js": [".ts", ".tsx", ".js", ".cjs", ".mjs"],
		},
		extensions: [".ts", ".tsx", ".js", ".cjs", ".mjs"],
	},
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist"),
		// This line is VERY important for VS Code debugging to attach properly
		// Tamper with it at your own risks
		devtoolModuleFilenameTemplate: "[absolute-resource-path]",
		clean: false,
	},
	plugins: [
		// No need to write a index.html
		new HtmlWebpackPlugin({
			title: "Brainstorm Demo",
			favicon: "",
		}),
		// Load environment variables during webpack bundle
		new Dotenv({
			systemvars: true,
		}),
		// Extract CSS to separate file
		new MiniCssExtractPlugin({
			filename: "css/mystyles.css",
		}),
	],
	devServer: {
		// keep port in sync with VS Code launch.json
		port: 8080,
		// Hot-reloading, the sole reason to use webpack here <3
		hot: true,
	},
};
