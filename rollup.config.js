import summary from 'rollup-plugin-summary';
import copy from 'rollup-plugin-copy';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

export default {
  input: 'main.js',  
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
  },
  onwarn(warning) {
    if (warning.code !== 'THIS_IS_UNDEFINED') {
      console.error(`(!) ${warning.message}`);
    }
  },
  plugins: [
    copy({
      targets: [
        { src: 'src/assets/*', dest: 'dist/' }, 
        { src: 'index.html', dest: 'dist/' },
        { src: 'favicon.ico', dest: 'dist/' },
        { src: 'src/styles/global.css', dest: 'dist/' }
      ],
      flatten: false,
      verbose: true, 
    }),
    replace({
      preventAssignment: true,
      'Reflect.decorate': 'undefined',
      'process.env.NODE_ENV': JSON.stringify(process.env.MODE || 'development'),
    }),
    resolve(),
    terser({
      ecma: 2021,
      module: true,
      warnings: true,
      mangle: {
        properties: {
          regex: /^__/,
        },
      },
    }),
    summary(),
  ],
  watch: {
    include: 'src/**',
    clearScreen: true,
  },
};
