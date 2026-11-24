import { readFileSync } from 'node:fs';
import type { StorybookConfig } from '@storybook/web-components-vite';
import { cemWatch } from './cem-watch.ts';

const favicon = `data:image/svg+xml,${encodeURIComponent(
  readFileSync(
    new URL('../vendor/illustrations/pic-blocks.svg', import.meta.url),
    'utf8',
  ),
)}`;

const config: StorybookConfig = {
  stories: ['../src/docs/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  managerHead: (head) => `${head}<link rel="icon" href="${favicon}" />`,
  // CSS handling (litCssPlugin for component `*.css` imports, plus the
  // LightningCSS config that preserves `light-dark()`) lives in the root
  // vite.config.ts, which Storybook's Vite builder loads and merges.
  // cemWatch is Storybook-only (it keeps the autodocs manifest fresh), so it
  // lives here rather than in the shared config the library build also uses.
  viteFinal: (config) => {
    config.plugins = [...(config.plugins ?? []), cemWatch()];
    return config;
  },
};

export default config;
