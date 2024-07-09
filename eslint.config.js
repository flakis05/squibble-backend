import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';


const customConfigs = {
    ignores: [
        "node_modules", "**/dist", "generated", "**/webpack.config.js", "**/bin"
    ]
}

export default [
    ...tseslint.config(
        eslint.configs.recommended,
        ...tseslint.configs.strict,
        ...tseslint.configs.stylistic
    ),
    customConfigs
];