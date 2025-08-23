import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import { readFileSync } from 'node:fs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.mjs',
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [
    typescript({ tsconfig: './tsconfig.rollup.json' }),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.ts', '.tsx'],
      presets: [
        [
          '@babel/preset-react',
          {
            runtime: 'automatic',
          },
        ],
      ],
    }),
    {
      name: 'copy-styles',
      writeBundle() {
        const css = readFileSync('src/styles.css', 'utf8');
        mkdirSync(dirname('dist/styles.css'), { recursive: true });
        writeFileSync('dist/styles.css', css, 'utf8');
      },
    },
  ],
  external: ['react', 'react-dom', 'react/jsx-runtime', 'next'],
};