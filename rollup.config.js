import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel';

export default [
  // UMD build
  {
    input: 'src/handsontableInitializer.js',
    output: {
      file: 'dist/handsontable-initializer.js',
      format: 'umd',
      name: 'initializeHandsontable',
      exports: 'default',
      sourcemap: true,
      globals: {
        jquery: 'jQuery',
        handsontable: 'Handsontable',
        moment: 'moment'
      }
    },
    external: ['jquery', 'handsontable', 'moment'],
    plugins: [
      resolve(),
      commonjs(),
      babel({ babelHelpers: 'bundled' }),
      terser()
    ]
  },
  // ESM build
  {
    input: 'src/handsontableInitializer.js',
    output: {
      file: 'dist/handsontable-initializer.esm.js',
      format: 'esm',
      sourcemap: true
    },
    external: ['jquery', 'handsontable', 'moment'],
    plugins: [
      resolve(),
      commonjs(),
      babel({ babelHelpers: 'bundled' }),
      terser()
    ]
  }
];
