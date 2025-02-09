import eslintJs from '@eslint/js'
import tsEslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'
import pluginVue from 'eslint-plugin-vue'

// https://stackoverflow.com/a/78938397/356016
export default [
    {
        //---- GLOBAL IGNORES
        // note folders can only be ignored at the global level, per-cfg you must do: '**/dist/**/*'
        ignores: [
            '**/dist/',
            '**/vendor/',
        ],
    },

    // general
    eslintJs.configs['recommended'],
    {
        files: ['**/*.{js,ts,jsx,tsx,vue}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        rules: {},
    },

    // TypeScript
    ...tsEslint.configs['recommended'],
    {
        files: ['**/*.{ts,tsx,vue}'],
        languageOptions: {
            parser: tsEslint.parser,
        },
    },

    // Vue
    ...pluginVue.configs['flat/recommended'],
    {
        files: ['**/*.vue'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tsEslint.parser,  // parse TS inside VUE
            },
        },
    },
];
