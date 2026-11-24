import { html } from 'lit';
import { test } from 'vitest';
import type { StatusBadgeType } from '../../src/components/moz-status-badge/moz-status-badge';
import '../../src/components/moz-icon/moz-icon';
import '../../src/components/moz-status-badge/moz-status-badge';
import { snapshot, snapshotContrast, snapshotDark } from './snapshot';

const types: StatusBadgeType[] = [
  'default',
  'ghost',
  'neutral',
  'success',
  'warning',
  'critical',
  'information',
];

const badges = html`<div
  style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;"
>
  ${types.map((t) => html`<moz-status-badge type=${t}>${t}</moz-status-badge>`)}
  <moz-status-badge type="success" icon-start="checkmark"
    >Approved</moz-status-badge
  >
  <moz-status-badge>
    <moz-icon slot="icon" name="notification-fill" color="success"></moz-icon>
    Live
  </moz-status-badge>
  <moz-status-badge size="large">
    <moz-icon slot="icon" name="history" color="warning"></moz-icon>
    Awaiting review
  </moz-status-badge>
</div>`;

test('status-badge variants', () => snapshot('status-badge-variants', badges));

test('status-badge dark', () => snapshotDark('status-badge-dark', badges));

test('status-badge high-contrast', () =>
  snapshotContrast('status-badge-high-contrast', badges));
