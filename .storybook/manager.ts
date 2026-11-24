import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';
// The same illustration the landing page leads with, inlined because the
// manager can't render <moz-illustration> (it's React, outside the preview).
import picBlocks from '../src/generated/illustrations/pic-blocks';

const mark = `data:image/svg+xml,${encodeURIComponent(picBlocks)}`;

// setConfig takes a whole theme, so picking a base is unavoidable; read the OS
// preference so the chrome still lands where Storybook's own default would.
const base = window.matchMedia('(prefers-color-scheme: dark)').matches
  ? 'dark'
  : 'light';

addons.setConfig({
  theme: create({
    base,
    brandTitle: `
      <img
        src="${mark}"
        alt=""
        width="28"
        height="28"
        style="vertical-align: middle; margin-inline-end: 0.5rem"
      />
      <span style="vertical-align: middle">lit-web-components</span>
    `,
    brandUrl: 'https://github.com/mozilla/lit-web-components',
    brandTarget: '_blank',
  }),
});
