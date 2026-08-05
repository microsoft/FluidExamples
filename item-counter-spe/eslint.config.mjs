import eslintReact from "@eslint-react/eslint-plugin";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
), eslintReact.configs["recommended-typescript"], {
    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
        },

        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",

        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
    },

    rules: {
        "@eslint-react/exhaustive-deps": "off",
        "@eslint-react/naming-convention-ref-name": "off",
        "@eslint-react/rules-of-hooks": "off",
        "@eslint-react/set-state-in-effect": "off",
        "@eslint-react/use-state": "off",
        "no-undef": "off",
        "no-useless-assignment": "off",
        "preserve-caught-error": "off",
    },
}];