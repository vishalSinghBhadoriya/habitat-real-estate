import js from '@eslint/js'
import ts from 'typescript-eslint'
export default ts.config({ignores:['dist/**','node_modules/**']},js.configs.recommended,...ts.configs.recommended,{files:['scripts/**/*.mjs'],languageOptions:{globals:{process:'readonly',console:'readonly',document:'readonly',innerWidth:'readonly',PerformanceObserver:'readonly',sessionStorage:'readonly',performance:'readonly'}}})
