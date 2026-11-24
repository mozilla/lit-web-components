import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { expect } from 'storybook/test';
import './moz-status-badge';
import '../moz-icon/moz-icon';
import { type IconName, iconNames } from '../../generated/icons';
import type { StatusBadgeSize, StatusBadgeType } from './moz-status-badge';

interface Args {
  type: StatusBadgeType;
  size: StatusBadgeSize;
  label: string;
  iconStart?: IconName;
}

const types: StatusBadgeType[] = [
  'default',
  'ghost',
  'neutral',
  'success',
  'warning',
  'critical',
  'information',
];

const meta: Meta<Args> = {
  title: 'Components/Status Badge',
  component: 'moz-status-badge',
  tags: ['autodocs', 'stable'],
  argTypes: {
    type: { control: 'select', options: types },
    size: { control: 'inline-radio', options: ['default', 'large'] },
    label: { control: 'text' },
    iconStart: { control: 'select', options: [undefined, ...iconNames] },
  },
  args: {
    type: 'default',
    size: 'default',
    label: 'Status',
  },
  render: (args) => html`
    <moz-status-badge
      type=${args.type}
      size=${args.size}
      icon-start=${ifDefined(args.iconStart)}
    >
      ${args.label}
    </moz-status-badge>
  `,
};

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const badge = canvasElement.querySelector('moz-status-badge')!;
    await badge.updateComplete;
    expect(badge.shadowRoot?.querySelector('.badge')).toBeTruthy();
  },
};

export const Ghost: Story = { args: { type: 'ghost', label: 'Draft' } };
export const Success: Story = { args: { type: 'success', label: 'Approved' } };
export const Warning: Story = { args: { type: 'warning', label: 'Pending' } };
export const Critical: Story = { args: { type: 'critical', label: 'Blocked' } };
export const Information: Story = {
  args: { type: 'information', label: 'In review' },
};

export const WithIcon: Story = {
  args: { type: 'success', label: 'Approved', iconStart: 'checkmark' },
};

// The dev hub's add-on status (Figma 3018-71745): a default pill whose dot
// carries the status colour. Slotted because that colour is independent of the
// badge's type, which `icon-start` can't express.
export const WithStatusDot: Story = {
  args: { type: 'default', label: 'Live' },
  render: (args) => html`
    <moz-status-badge type=${args.type}>
      <moz-icon slot="icon" name="notification-fill" color="success"></moz-icon>
      ${args.label}
    </moz-status-badge>
  `,
  play: async ({ canvasElement }) => {
    const badge = canvasElement.querySelector('moz-status-badge')!;
    await badge.updateComplete;
    const icon = badge.querySelector('moz-icon')!;
    await icon.updateComplete;
    expect(icon.assignedSlot?.name).toBe('icon');
    // The slotted icon takes the badge's icon sizing, not moz-icon's default.
    expect(getComputedStyle(icon).getPropertyValue('--icon-size')).toBe(
      getComputedStyle(badge).getPropertyValue('--icon-size-xsmall'),
    );
  },
};

export const Neutral: Story = {
  args: { type: 'neutral', label: 'Superseded' },
  tags: ['new'],
};

// The large step pairs with the dev hub's standalone add-on status, where the
// badge carries a 15px label rather than trailing a title.
export const Large: Story = {
  args: { size: 'large', label: 'Awaiting review' },
  tags: ['new'],
  render: (args) => html`
    <moz-status-badge size=${args.size} type=${args.type}>
      <moz-icon slot="icon" name="history" color="warning"></moz-icon>
      ${args.label}
    </moz-status-badge>
  `,
  play: async ({ canvasElement }) => {
    const badge = canvasElement.querySelector('moz-status-badge')!;
    await badge.updateComplete;
    const icon = badge.querySelector('moz-icon')!;
    await icon.updateComplete;
    expect(badge.getBoundingClientRect().height).toBe(32);
    // The large step steps the icon up with the text.
    expect(icon.getBoundingClientRect().width).toBe(16);
  },
};

export const AllTypes: Story = {
  render: () => html`
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
      ${types.map(
        (t) => html`<moz-status-badge type=${t}>${t}</moz-status-badge>`,
      )}
    </div>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
      <moz-status-badge>
        <moz-icon slot="icon" name="notification-fill" color="success"></moz-icon>
        Live
      </moz-status-badge>
      <moz-status-badge size="large">
        <moz-icon slot="icon" name="notification-fill" color="success"></moz-icon>
        Live
      </moz-status-badge>
    </div>
  `,
};
