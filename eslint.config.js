// eslint.config.js
import globals from "globals";
import pluginPrettier from "eslint-plugin-prettier";
import pluginN from "eslint-plugin-n";

export default [
    {
        ignores: [
            "node_modules/**",
            "dist/**",
            "build/**",
            ".vscode/**",
            ".DS_Store",
            "README.md",
            "src/common/configs/swagger/**",
        ],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
            },
        },
        plugins: {
            prettier: pluginPrettier,
            n: pluginN,
        },
        rules: {
            "prettier/prettier": "error",
            "n/no-missing-import": "off",
            "n/no-extraneous-import": "warn",
            "n/no-missing-require": "error",
            "n/no-deprecated-api": "warn",
            "no-console": "off",
            "no-process-exit": "off",
            "no-undef": "error",
        },
    },
];
