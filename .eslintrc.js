module.exports = {
    extends: ["@sapphire", "prettier"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2023,
        project: "../../tsconfig.eslint.json",
    },
    plugins: ["simple-import-sort", "unused-imports"],
    root: true,
    rules: {
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/unbound-method": "off",
        "@typescript-eslint/explicit-member-accessibility": "off",
        "@typescript-eslint/no-invalid-this": "off",
        "array-callback-return": "off",
        "simple-import-sort/imports": "warn",
        "simple-import-sort/exports": "warn",
        "unused-imports/no-unused-imports": "error",
        "@typescript-eslint/no-throw-literal": "off",
        "unused-imports/no-unused-vars": [
            "warn",
            {
                vars: "all",
                varsIgnorePattern: "^_",
                args: "after-used",
                argsIgnorePattern: "^_",
            },
        ],
    },
};
