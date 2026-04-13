import { recommended } from "@fluidframework/eslint-config-fluid/flat.mjs";

export default [
	...recommended,
	{
		rules: {
			// Example apps use sub-path imports (e.g. "@fluidframework/odsp-client/beta")
			// and relative imports with extensions, which this rule disallows.
			"import-x/no-internal-modules": "off",

			// Explicit return types add verbosity that hurts readability in example code.
			"@typescript-eslint/explicit-function-return-type": "off",
			"@typescript-eslint/explicit-module-boundary-types": "off",

			// Existing files use snake_case naming; renaming would break imports across the project.
			"unicorn/filename-case": "off",

			// Allow == null checks which cover both null and undefined.
			eqeqeq: ["error", "smart"],

			// Common variable naming patterns in React code and callback-heavy code.
			"@typescript-eslint/no-shadow": "off",

			// Example code interacts with external APIs (Microsoft Graph, MSAL) that
			// return loosely-typed data. Suppressing these keeps focus on the Fluid patterns.
			"@typescript-eslint/no-unsafe-assignment": "off",
			"@typescript-eslint/no-unsafe-member-access": "off",
			"@typescript-eslint/no-unsafe-argument": "off",
			"@typescript-eslint/strict-boolean-expressions": "off",

			// Some transitive deps are used directly in examples.
			"import-x/no-extraneous-dependencies": "off",

			// CSS side-effect imports are expected.
			"import-x/no-unassigned-import": "off",

			// null is used by external APIs and React patterns.
			"unicorn/no-null": "off",

			// Top-level await doesn't work in all bundler configurations.
			"unicorn/prefer-top-level-await": "off",
		},
	},
];
