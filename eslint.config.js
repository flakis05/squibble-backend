import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';


export default [
    eslint.configs.recommended,
    ...tseslint.config(
        {
            ignores: [
                "**/dist", "generated/*", "**/webpack.config.js", "**/bin"
            ]
        },
        eslint.configs.recommended,
        ...tseslint.configs.strict,
        ...tseslint.configs.stylistic,
        {
            rules: {
                "@typescript-eslint/no-explicit-any": "off"
            }
        }
    ),
    eslintPluginPrettierRecommended
];