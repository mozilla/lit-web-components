import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, waitFor } from 'storybook/test';
import { logEvents } from '../../../.storybook/story-actions';
import './moz-pagination';
import type { MozPagination, PaginationSelectDetail } from './moz-pagination';

const href = (page: number) => `#page-${page}`;

const meta: Meta = {
  title: 'Components/Pagination',
  component: 'moz-pagination',
  tags: ['autodocs', 'stable', 'new'],
  decorators: [logEvents('moz-pagination:select')],
  render: () =>
    html`<moz-pagination
      .page=${2}
      .totalPages=${8}
      .hrefForPage=${href}
    ></moz-pagination>`,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

// The first page disables Previous; the last disables Next.
export const FirstPage: Story = {
  render: () =>
    html`<moz-pagination
      .page=${1}
      .totalPages=${8}
      .hrefForPage=${href}
    ></moz-pagination>`,
};

export const LastPage: Story = {
  render: () =>
    html`<moz-pagination
      .page=${8}
      .totalPages=${8}
      .hrefForPage=${href}
    ></moz-pagination>`,
};

// A long run truncates to a window, pinning the first and last page.
export const Truncated: Story = {
  render: () =>
    html`<moz-pagination
      .page=${28}
      .totalPages=${57}
      .hrefForPage=${href}
    ></moz-pagination>`,
};

// Sized by item count rather than page count.
export const FromItemTotal: Story = {
  render: () =>
    html`<moz-pagination
      .page=${3}
      .total=${94}
      .pageSize=${10}
      .hrefForPage=${href}
    ></moz-pagination>`,
};

// Without hrefForPage the steps are buttons and the event is the only signal.
export const WithoutLinks: Story = {
  render: () =>
    html`<moz-pagination .page=${2} .totalPages=${5}></moz-pagination>`,
};

export const Localized: Story = {
  render: () =>
    html`<moz-pagination
      .page=${2}
      .totalPages=${5}
      .hrefForPage=${href}
      previous-label="Précédent"
      next-label="Suivant"
      label="Pagination des résultats"
      page-label="Page {page}"
    ></moz-pagination>`,
};

// --- Interaction tests (test-only: run under Vitest/CI, hidden from docs) ---

const pager = async (canvasElement: HTMLElement) => {
  const el = canvasElement.querySelector('moz-pagination') as MozPagination;
  await el.updateComplete;
  return el;
};

const stepLabels = (el: MozPagination) =>
  [...el.shadowRoot!.querySelectorAll('li')].map((li) =>
    li.textContent?.replace(/\s+/g, ' ').trim(),
  );

// nav landmark, ordered list, and a step either side of the numbers.
export const Semantics: Story = {
  tags: ['!dev', '!autodocs'],
  render: () =>
    html`<moz-pagination
      .page=${2}
      .totalPages=${3}
      .hrefForPage=${href}
      label="Activity pages"
    ></moz-pagination>`,
  play: async ({ canvasElement }) => {
    const el = await pager(canvasElement);
    const root = el.shadowRoot!;
    expect(root.querySelector('nav')!.getAttribute('aria-label')).toBe(
      'Activity pages',
    );
    expect(root.querySelector('ol')).toBeTruthy();
    expect(stepLabels(el)).toEqual([
      'Previous Previous',
      'Page 1 1',
      'Page 2 2',
      'Page 3 3',
      'Next Next',
    ]);
  },
};

// The filled step is the current page; every other step is ghosted. The same
// step carries aria-current="page" through to the anchor moz-button renders,
// so the state is real ARIA rather than wording in the name.
export const CurrentPageIsFilled: Story = {
  tags: ['!dev', '!autodocs'],
  render: () =>
    html`<moz-pagination
      .page=${2}
      .totalPages=${3}
      .hrefForPage=${href}
    ></moz-pagination>`,
  play: async ({ canvasElement }) => {
    const el = await pager(canvasElement);
    const buttons = [...el.shadowRoot!.querySelectorAll('moz-button')];
    expect(buttons.map((b) => b.getAttribute('variant'))).toEqual([
      'ghost',
      'ghost',
      'primary',
      'ghost',
      'ghost',
    ]);

    const anchors = await Promise.all(
      buttons.map(async (b) => {
        await (b as unknown as { updateComplete: Promise<unknown> })
          .updateComplete;
        return b.shadowRoot!.querySelector('a')?.getAttribute('aria-current');
      }),
    );
    expect(anchors).toEqual([null, null, 'page', null, null]);
  },
};

// Only the dead ends are disabled — the current page stays a live link.
export const EndsDisableAtTheEdges: Story = {
  tags: ['!dev', '!autodocs'],
  render: () =>
    html`<moz-pagination
      .page=${1}
      .totalPages=${2}
      .hrefForPage=${href}
    ></moz-pagination>`,
  play: async ({ canvasElement }) => {
    const el = await pager(canvasElement);
    const root = el.shadowRoot!;
    const prev = root.querySelector('moz-button[rel="prev"]')!;
    expect(prev.hasAttribute('disabled')).toBe(true);
    expect(prev.hasAttribute('href')).toBe(false);
    expect(
      root.querySelector('moz-button[rel="next"]')!.hasAttribute('disabled'),
    ).toBe(false);
    const current = [...root.querySelectorAll('moz-button')].find(
      (b) => b.getAttribute('variant') === 'primary',
    )!;
    expect(current.hasAttribute('disabled')).toBe(false);
  },
};

// A long run keeps maxSlots numbers, pinning the first and last behind
// ellipses so the control's width doesn't jump as the window moves.
export const TruncatesLongRuns: Story = {
  tags: ['!dev', '!autodocs'],
  render: () =>
    html`<moz-pagination
      .page=${28}
      .totalPages=${57}
      .maxSlots=${7}
      .hrefForPage=${href}
    ></moz-pagination>`,
  play: async ({ canvasElement }) => {
    const el = await pager(canvasElement);
    expect(stepLabels(el)).toEqual([
      'Previous Previous',
      'Page 1 1',
      '…',
      'Page 26 26',
      'Page 27 27',
      'Page 28 28',
      'Page 29 29',
      'Page 30 30',
      '…',
      'Page 57 57',
      'Next Next',
    ]);
  },
};

// No ellipsis where the window already runs up against the pinned page.
export const TruncatesOneSidedNearTheStart: Story = {
  tags: ['!dev', '!autodocs'],
  render: () =>
    html`<moz-pagination
      .page=${1}
      .totalPages=${57}
      .maxSlots=${7}
      .hrefForPage=${href}
    ></moz-pagination>`,
  play: async ({ canvasElement }) => {
    const el = await pager(canvasElement);
    expect(stepLabels(el)).toEqual([
      'Previous Previous',
      'Page 1 1',
      'Page 2 2',
      'Page 3 3',
      'Page 4 4',
      'Page 5 5',
      'Page 6 6',
      '…',
      'Page 57 57',
      'Next Next',
    ]);
  },
};

export const DerivesPagesFromItemTotal: Story = {
  tags: ['!dev', '!autodocs'],
  render: () =>
    html`<moz-pagination .page=${1} .total=${94} .pageSize=${10}></moz-pagination>`,
  play: async ({ canvasElement }) => {
    const el = await pager(canvasElement);
    // 94 items at 10 a page is 10 pages, so the last pinned step reads 10.
    expect(stepLabels(el).at(-2)).toBe('Page 10 10');
  },
};

// Nothing to page through, nothing to render.
export const HiddenForASinglePage: Story = {
  tags: ['!dev', '!autodocs'],
  render: () =>
    html`<moz-pagination .page=${1} .total=${4} .pageSize=${10}></moz-pagination>`,
  play: async ({ canvasElement }) => {
    const el = await pager(canvasElement);
    expect(el.shadowRoot!.querySelector('nav')).toBeNull();
  },
};

export const SelectEvent: Story = {
  tags: ['!dev', '!autodocs'],
  render: () =>
    html`<moz-pagination
      .page=${1}
      .totalPages=${3}
      .hrefForPage=${href}
    ></moz-pagination>`,
  play: async ({ canvasElement }) => {
    const el = await pager(canvasElement);
    // Stop the anchor from actually navigating the test page.
    el.addEventListener('click', (e) => e.preventDefault(), true);
    let detail: PaginationSelectDetail | undefined;
    el.addEventListener('moz-pagination:select', (e) => {
      detail = (e as CustomEvent<PaginationSelectDetail>).detail;
    });
    el.shadowRoot!.querySelector<HTMLElement>(
      'moz-button[rel="next"]',
    )!.click();
    expect(detail?.page).toBe(2);
  },
};

// Canceling blocks the link's navigation, so an SPA can route instead.
export const SelectCancelable: Story = {
  tags: ['!dev', '!autodocs'],
  render: () =>
    html`<moz-pagination
      .page=${1}
      .totalPages=${3}
      .hrefForPage=${href}
    ></moz-pagination>`,
  play: async ({ canvasElement }) => {
    const el = await pager(canvasElement);
    el.addEventListener('moz-pagination:select', (e) => e.preventDefault());
    let prevented = false;
    el.addEventListener('click', (e) => {
      prevented = e.defaultPrevented;
    });
    el.shadowRoot!.querySelector<HTMLElement>(
      'moz-button[rel="next"]',
    )!.click();
    expect(prevented).toBe(true);
  },
};

// page-label is a template so a localizer can reorder around the number
// without needing a function property (and so it works from plain HTML).
export const LocalizesStepNames: Story = {
  tags: ['!dev', '!autodocs'],
  render: () =>
    html`<moz-pagination
      .page=${2}
      .totalPages=${3}
      .hrefForPage=${href}
      label="Pagination des résultats"
      previous-label="Précédent"
      next-label="Suivant"
      page-label="{page} página"
    ></moz-pagination>`,
  play: async ({ canvasElement }) => {
    const el = await pager(canvasElement);
    expect(
      el.shadowRoot!.querySelector('nav')!.getAttribute('aria-label'),
    ).toBe('Pagination des résultats');
    expect(stepLabels(el)).toEqual([
      'Précédent Précédent',
      '1 página 1',
      '2 página 2',
      '3 página 3',
      'Suivant Suivant',
    ]);
  },
};

// Narrow container: the full row can't fit, so the ends drop to chevrons and
// the window tightens.
export const CompactsInANarrowContainer: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => html`
    <div style="inline-size:320px;">
      <moz-pagination
        .page=${28}
        .totalPages=${57}
        .hrefForPage=${href}
      ></moz-pagination>
    </div>
  `,
  play: async ({ canvasElement }) => {
    const el = await pager(canvasElement);
    await waitFor(() => expect(el.hasAttribute('data-compact')).toBe(true));
    // First, current and last rather than seven, both ellipses still in place.
    // The ends read empty here because their name moved into the button's own
    // shadow root with `icon-only` — asserted below.
    expect(stepLabels(el)).toEqual([
      '',
      'Page 1 1',
      '…',
      'Page 28 28',
      '…',
      'Page 57 57',
      '',
    ]);
    // The ends keep their accessible names even with the words gone.
    const prev = el.shadowRoot!.querySelector('moz-button[rel="prev"]')!;
    expect(prev.getAttribute('icon-only')).toBe('Previous');
    expect(prev.getAttribute('icon-start')).toBe('chevron-left');
    expect(
      el
        .shadowRoot!.querySelector('moz-button[rel="next"]')!
        .getAttribute('icon-start'),
    ).toBe('chevron-right');
  },
};

// A container with room keeps the full layout, so compacting is not one-way.
export const StaysFullWhenThereIsRoom: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => html`
    <div style="inline-size:900px;">
      <moz-pagination
        .page=${28}
        .totalPages=${57}
        .hrefForPage=${href}
      ></moz-pagination>
    </div>
  `,
  play: async ({ canvasElement }) => {
    const el = await pager(canvasElement);
    await waitFor(() => expect(stepLabels(el)).toHaveLength(11));
    expect(el.hasAttribute('data-compact')).toBe(false);
    expect(stepLabels(el).at(0)).toBe('Previous Previous');
  },
};
