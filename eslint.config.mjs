import stylistic from '@stylistic/eslint-plugin';

export default [ {
    plugins: {
      '@stylistic': stylistic
    },
   rules: {
        '@stylistic/array-bracket-spacing': [ 'error', 'always' ]
    }
} ];
