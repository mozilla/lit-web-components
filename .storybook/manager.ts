import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';
import type {
  Badge,
  TagBadgeParameters,
} from 'storybook-addon-tag-badges/manager-helpers';
// :root custom properties for the manager chrome, which renders outside the
// preview iframe and so inherits none of the preview's token CSS.
import '../src/generated/all-tokens.css';
import picBlocks from '../src/generated/illustrations/pic-blocks';

// The manager is React, outside the preview, so <moz-illustration> can't
// render here — inline the illustration the landing page leads with instead.
const mark = `data:image/svg+xml,${encodeURIComponent(picBlocks)}`;

// setConfig takes a whole theme, so picking a base is unavoidable; read the OS
// preference so the chrome still lands where Storybook's own default would.
const base = window.matchMedia('(prefers-color-scheme: dark)').matches
  ? 'dark'
  : 'light';

type StatusType = 'success' | 'warning' | 'critical' | 'information';

// The darker same-hue shade moz-status-badge uses for its label, so the text
// clears AA on the light tint; the shades invert for dark mode.
const textColor: Record<StatusType, string> = {
  success: 'light-dark(var(--color-green-60), var(--color-green-20))',
  warning: 'light-dark(var(--color-yellow-60), var(--color-yellow-20))',
  critical: 'light-dark(var(--color-red-60), var(--color-red-20))',
  information: 'light-dark(var(--color-violet-60), var(--color-violet-20))',
};

// moz-status-badge's look, rebuilt as an emotion object: the manager is React,
// so the component itself can't be mounted here. Keep in sync with
// moz-status-badge.css.
const statusBadge = (
  text: string,
  type: StatusType,
  tooltip: Badge['tooltip'],
): Badge => ({
  text,
  tooltip,
  style: {
    // The tokens resolve light-dark() against the element's own scheme.
    colorScheme: 'light dark',
    // The addon's own badge is a block with vertical padding, which leaves the
    // label sitting high in the sidebar; centre it the way the component does.
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    minHeight: '22px',
    paddingBlock: 0,
    paddingInline: 'var(--space-xsmall)',
    border: '1px solid var(--badge-border-color)',
    borderRadius: 'var(--border-radius-circle)',
    // The type scale has no xsmall step, so drop just below --font-size-small.
    fontSize: '0.733rem',
    fontWeight: 'var(--font-weight-semibold)',
    lineHeight: 1.1,
    color: textColor[type],
    backgroundColor: `var(--background-color-${type})`,
  },
});

// Component status, mirroring Firefox's Storybook (its addon-component-status):
// the same three levels in the same place, worded for a standalone library
// rather than for Firefox chrome.
const status = (
  tag: string,
  text: string,
  type: StatusType,
  desc: string,
): TagBadgeParameters[number] => ({
  tags: tag,
  badge: statusBadge(text, type, { title: text, desc }),
  display: { sidebar: false, toolbar: ['docs', 'story'], mdx: true },
});

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
  tagBadges: [
    {
      tags: 'new',
      badge: statusBadge('New', 'success', {
        title: 'New',
        desc: 'Added in the current minor release.',
      }),
    },
    status(
      'stable',
      'Stable',
      'information',
      'The API is settled and the component is ready for general use.',
    ),
    status(
      'in-development',
      'In Development',
      'warning',
      'Actively being built out and usable, but the API may still change.',
    ),
    status(
      'unstable',
      'Unstable',
      'critical',
      'Still in the early stages of development, and not ready for general use.',
    ),
  ] satisfies TagBadgeParameters,
});
