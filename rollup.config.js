import { defineConfig } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-ts";
import rollupExternalModules from "rollup-external-modules";
const external = rollupExternalModules;
export default defineConfig({
    external,
    input: "./index.ts",
    output: [
        { sourcemap: true, file: "./index.mjs", format: "esm" },
        {
            sourcemap: true,
            file: "./index.cjs",
            format: "cjs",
            exports: "auto",
        },
    ],
    plugins: [resolve(), commonjs(), typescript({ transpiler: "typescript" })],
});
