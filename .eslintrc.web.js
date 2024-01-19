module.exports = {
    root: true,
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    parserOptions: {
        ecmaVersion: 2023,
        project: "../../tsconfig.eslint.json",
    },
    plugins: ["@typescript-eslint", "simple-import-sort", "unused-imports"],
    extends: ["eslint:recommended", "next", "next/core-web-vitals", "plugin:@typescript-eslint/recommended", "prettier"],
    rules: {
        "no-unused-vars": "off",
        "no-alert": "off",
        "no-console": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "react/no-unescaped-entities": "off",
        "no-param-reassign": "off",
        "import/prefer-default-export": "off",
        "no-return-await": "off",
        "arrow-body-style": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/dot-notation": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-shadow": "off",
        "@typescript-eslint/ban-types": "off",
        "import/no-extraneous-dependencies": "off",
        "no-nested-ternary": "off",
        "consistent-return": "off",

        "react/display-name": "off",
        "react/jsx-curly-brace-presence": ["warn", { props: "never", children: "never" }],

        "@typescript-eslint/no-unused-vars": "off",
        "unused-imports/no-unused-imports": "warn",
        "unused-imports/no-unused-vars": [
            "warn",
            {
                vars: "all",
                varsIgnorePattern: "^_",
                args: "after-used",
                argsIgnorePattern: "^_",
            },
        ],
        // #endregion  //*======== Unused Import ===========

        // #region  //*=========== Import Sort ===========
        "simple-import-sort/exports": "warn",
        "simple-import-sort/imports": [
            "warn",
            {
                groups: [
                    // ext library & side effect imports
                    ["^@?\\w", "^\\u0000"],
                    // {s}css files
                    ["^.+\\.s?css$"],
                    // Lib and hooks
                    ["^@/lib", "^@/hooks"],
                    // static data
                    ["^@/data"],
                    // components
                    ["^@/components", "^@/container"],
                    // zustand store
                    ["^@/store"],
                    // Other imports
                    ["^@/"],
                    // relative paths up until 3 level
                    [
                        "^\\./?$",
                        "^\\.(?!/?$)",
                        "^\\.\\./?$",
                        "^\\.\\.(?!/?$)",
                        "^\\.\\./\\.\\./?$",
                        "^\\.\\./\\.\\.(?!/?$)",
                        "^\\.\\./\\.\\./\\.\\./?$",
                        "^\\.\\./\\.\\./\\.\\.(?!/?$)",
                    ],
                    ["^@/types"],
                    // other that didnt fit in
                    ["^"],
                ],
            },
        ],
        // #endregion  //*======== Import Sort ===========
    },
    globals: {
        React: true,
        JSX: true,
    },
};
