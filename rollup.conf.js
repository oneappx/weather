import path from 'path'
import buble from 'rollup-plugin-buble'
import cjs from 'rollup-plugin-commonjs'
import globals from 'rollup-plugin-node-globals'
import replace from 'rollup-plugin-replace'
import resolve from 'rollup-plugin-node-resolve'
import less from 'rollup-plugin-less';
import alias from 'rollup-plugin-alias';

export default {
  input: './src/light.js',
  output: {
    file: './build/light.js',
    format: 'iife'
  },
  plugins: [
    resolve({jsnext: true}),
    less({
      output: './build/light.css'
    }),
    alias({
      _: path.resolve(__dirname, './src')
    }),
    cjs({
      include: 'node_modules/**'
    }),
    buble(),
    globals(),

    replace({ 'process.env.NODE_ENV': JSON.stringify('development') , 'React.createElement': 'preact.h'})
  ],
  sourcemap: true
}
