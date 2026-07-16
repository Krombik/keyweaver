import { defineConfig } from 'tsdown';
import fs from 'node:fs/promises';

export default defineConfig({
  entry: 'src/index.ts',
  outDir: 'build',
  format: ['esm', 'cjs'],
  platform: 'neutral',
  target: 'es2020',
  dts: true,
  sourcemap: true,
  clean: true,
  onSuccess: async () => {
    const {
      name,
      version,
      description,
      author,
      license,
      repository,
      bugs,
      homepage,
      keywords,
      engines,
    } = JSON.parse(await fs.readFile('package.json', 'utf8'));

    await fs.writeFile(
      'build/package.json',
      JSON.stringify(
        {
          name,
          version,
          description,
          author,
          license,
          repository,
          bugs,
          homepage,
          keywords,
          engines,
          type: 'module',
          main: './index.cjs',
          module: './index.js',
          types: './index.d.ts',
          exports: {
            '.': {
              import: { types: './index.d.ts', default: './index.js' },
              require: { types: './index.d.cts', default: './index.cjs' },
            },
            './package.json': './package.json',
          },
          sideEffects: false,
          publishConfig: { access: 'public' },
        },
        null,
        2
      )
    );

    await fs.copyFile('LICENSE', 'build/LICENSE');
    await fs.copyFile('README.md', 'build/README.md');
  },
});
