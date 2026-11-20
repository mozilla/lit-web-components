import { html } from 'lit';
import { test } from 'vitest';
import '../../src/components/moz-pagination/moz-pagination';
import { snapshot, snapshotContrast, snapshotDark } from './snapshot';

const href = (page: number) => `#page-${page}`;

// Truncated at both ends, so one matrix covers the filled current step, the
// ghosted numbers, both ellipses and the pinned first/last page.
const pagination = html`
  <div style="display:flex;flex-direction:column;gap:1rem;align-items:flex-start;">
    <moz-pagination
      .page=${28}
      .totalPages=${57}
      .hrefForPage=${href}
    ></moz-pagination>
    <moz-pagination
      .page=${1}
      .totalPages=${4}
      .hrefForPage=${href}
    ></moz-pagination>
  </div>
`;

test('pagination', () => snapshot('pagination', pagination));

test('pagination dark', () => snapshotDark('pagination-dark', pagination));

// High contrast: the disabled end and the filled current step are the two
// that lean on the button a11y layer.
test('pagination high-contrast', () =>
  snapshotContrast('pagination-high-contrast', pagination));

// Narrow container: ends down to chevrons, window down to first/current/last.
const compact = html`
  <div style="inline-size:320px;">
    <moz-pagination
      .page=${28}
      .totalPages=${57}
      .hrefForPage=${href}
    ></moz-pagination>
  </div>
`;

test('pagination compact', () => snapshot('pagination-compact', compact));
