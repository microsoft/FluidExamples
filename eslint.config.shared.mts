export const exampleOverrides = {
  rules: {
    // Example apps use sub-path imports and relative imports with extensions.
    "import-x/no-internal-modules": "off",

    // Explicit return types add verbosity that hurts readability in example code.
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",

    // Existing files use snake_case naming; renaming would break project imports.
    "unicorn/filename-case": "off",

    // Allow == null checks, which cover both null and undefined.
    eqeqeq: ["error", "smart"],

    // Common variable naming patterns in React and callback-heavy code.
    "@typescript-eslint/no-shadow": "off",

    // External APIs return loosely typed data; keep the examples focused on Fluid.
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/strict-boolean-expressions": "off",

    // Some transitive dependencies are used directly in examples.
    "import-x/no-extraneous-dependencies": "off",

    // CSS side-effect imports are expected.
    "import-x/no-unassigned-import": "off",

    // null is used by external APIs and React patterns.
    "unicorn/no-null": "off",
    "@rushstack/no-new-null": "off",

    // Top-level await does not work in all bundler configurations.
    "unicorn/prefer-top-level-await": "off",
  },
};
