import { defineConfig } from "tsup";

export default defineConfig([
	{
		entry: ["./src/index.ts"],
		format: "esm",
		clean: true,
		skipNodeModulesBundle: true,
		minify: false,
		outDir: "./dist",
		sourcemap: true,
		treeshake: true,
		dts: true,
	},
	{
		entry: ["./src/index.ts"],
		format: "iife",
		clean: true,
		skipNodeModulesBundle: false,
		minify: true,
		treeshake: true,
		globalName: "inputman",
		outDir: "./dist",
	},
]);
