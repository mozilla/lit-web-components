import { html, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { MozLitElement } from '../../base/moz-lit-element';
import shared from '../../base/shared.css';
import '../moz-button/moz-button';
import styles from './moz-pagination.css';

/** `detail` of the `moz-pagination:select` event. */
export interface PaginationSelectDetail {
  page: number;
}

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

/**
 * Numbered steps kept once the control is too narrow for `maxSlots`: first,
 * current, last. Three rather than five so one row still holds at 320px with
 * room for three-digit page numbers.
 */
const COMPACT_SLOTS = 3;

/**
 * Inputs that change how wide the full layout wants to be, so the cached
 * measurement has to be thrown away. `page` isn't one: the window slides but
 * the slot count — and so the width — holds.
 */
const RESIZING_PROPS = [
  'maxSlots',
  'totalPages',
  'total',
  'pageSize',
  'previousLabel',
  'nextLabel',
  'pageLabel',
] as const;

/** The page numbers to render, ascending — gaps are where an ellipsis goes. */
function pageWindow(
  page: number,
  numPages: number,
  maxSlots: number,
): number[] {
  if (numPages <= maxSlots) return range(1, numPages);
  const inner = maxSlots - 2;
  const span = Math.floor((inner - 1) / 2);
  const to = Math.min(numPages - 1, Math.max(2, page - span) + inner - 1);
  return [1, ...range(Math.max(2, to - inner + 1), to), numPages];
}

/**
 * Pagination: a `<nav>` landmark wrapping Previous / numbered pages / Next.
 * The current page is the filled step, and carries `aria-current="page"`; the
 * ends disable themselves at the first and last page. A long run truncates to
 * a moving window of `maxSlots` numbers with the first and last page pinned
 * behind ellipses.
 *
 * Each step is a real link when `hrefForPage` is set, so a page stays
 * bookmarkable and middle-clickable; without it the steps are buttons and
 * `moz-pagination:select` is the only way to hear about a change.
 *
 * Renders nothing when there is one page or fewer — there is nothing to page.
 *
 * @fires moz-pagination:select - cancelable; a step was activated. detail is
 *   `{ page }`. preventDefault to block the link's navigation (e.g. SPA
 *   routing).
 */
export class MozPagination extends MozLitElement {
  static styles = [shared, styles];

  /** Current page, 1-based. */
  @property({ type: Number }) page = 1;

  /** Page count. Takes precedence over `total` / `pageSize`. */
  @property({ type: Number, attribute: 'total-pages' }) totalPages?: number;

  /** Item count across all pages; with `pageSize`, derives the page count. */
  @property({ type: Number }) total?: number;

  /** Items per page, used with `total`. */
  @property({ type: Number, attribute: 'page-size' }) pageSize = 20;

  /**
   * How many numbered steps to show, counting the pinned first and last, so
   * the control holds a stable width as the window slides.
   */
  @property({ type: Number, attribute: 'max-slots' }) maxSlots = 7;

  /**
   * Builds a step's href. Without it the steps render as buttons rather than
   * links. Property only — it takes a function, so it has no attribute.
   */
  @property({ attribute: false }) hrefForPage?: (page: number) => string;

  /** Accessible name for the nav landmark; pass a localized string. */
  @property() label = 'Pagination';

  /** Visible label for the previous-page step; pass a localized string. */
  @property({ attribute: 'previous-label' }) previousLabel = 'Previous';

  /** Visible label for the next-page step; pass a localized string. */
  @property({ attribute: 'next-label' }) nextLabel = 'Next';

  /**
   * A numbered step's accessible name, which is otherwise a bare digit.
   * `{page}` is replaced with the page number; pass a localized string.
   */
  @property({ attribute: 'page-label' }) pageLabel = 'Page {page}';

  @state() private compact = false;

  #resizeObserver = new ResizeObserver(() => this.#scheduleFitSync());

  #fitSyncFrame = 0;

  /**
   * What the full layout needs, measured only while it's the one rendered.
   * Compact hides the end labels, so measuring then would report a width the
   * control could always afford and flip it straight back out again.
   */
  #fullInlineSize = 0;

  connectedCallback(): void {
    super.connectedCallback();
    this.#observeSizes();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#resizeObserver.disconnect();
    cancelAnimationFrame(this.#fitSyncFrame);
    this.#fitSyncFrame = 0;
  }

  protected updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    if (RESIZING_PROPS.some((prop) => changed.has(prop))) {
      this.#fullInlineSize = 0;
    }
    this.toggleAttribute('data-compact', this.compact);
    this.#observeSizes();
    this.#scheduleFitSync();
  }

  // The steps are watched as well as the host, whose own block box never
  // changes width as they grow: a step only reaches its real size once its
  // moz-button has rendered, and a late font load moves it again.
  #observeSizes(): void {
    this.#resizeObserver.disconnect();
    this.#resizeObserver.observe(this);
    for (const step of this.#steps) this.#resizeObserver.observe(step);
  }

  get #steps(): HTMLElement[] {
    return [...(this.shadowRoot?.querySelectorAll('li') ?? [])];
  }

  // Same hazard as moz-segmented-control: `compact` resizes the very box being
  // observed, and mutating it during delivery trips "ResizeObserver loop
  // completed with undelivered notifications".
  #scheduleFitSync(): void {
    if (this.#fitSyncFrame) return;
    this.#fitSyncFrame = requestAnimationFrame(() => {
      this.#fitSyncFrame = 0;
      this.#syncFit();
    });
  }

  #syncFit(): void {
    if (!this.compact) this.#fullInlineSize = this.#measureRow();
    // Nothing rendered yet, or the cache was just dropped — rendering full
    // again is what takes the next measurement.
    if (!this.#fullInlineSize) {
      this.compact = false;
      return;
    }
    // Sub-pixel slack: a row needing exactly the space available still fits.
    this.compact = this.#fullInlineSize - this.clientWidth > 0.5;
  }

  // Steps don't shrink (see the CSS), so each one's box is its intrinsic
  // width whether or not the row has already wrapped — which is what makes an
  // unwrapped total recoverable from a wrapped layout.
  #measureRow(): number {
    const list = this.shadowRoot?.querySelector('ol');
    if (!list) return 0;
    const steps = this.#steps;
    if (!steps.length) return 0;
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    const total = steps.reduce((sum, step) => {
      const style = getComputedStyle(step);
      return (
        sum +
        step.getBoundingClientRect().width +
        (parseFloat(style.marginInlineStart) || 0) +
        (parseFloat(style.marginInlineEnd) || 0)
      );
    }, 0);
    return total + (steps.length - 1) * gap;
  }

  get #slots(): number {
    return this.compact
      ? Math.min(COMPACT_SLOTS, this.maxSlots)
      : this.maxSlots;
  }

  get #numPages(): number {
    if (this.totalPages != null)
      return Math.max(1, Math.floor(this.totalPages));
    if (this.total != null) {
      return Math.max(1, Math.ceil(this.total / this.pageSize));
    }
    return 1;
  }

  #select(page: number, event: MouseEvent) {
    const selectEvent = new CustomEvent<PaginationSelectDetail>(
      'moz-pagination:select',
      { bubbles: true, composed: true, cancelable: true, detail: { page } },
    );
    // A consumer that cancels wants to own navigation, so block the link's.
    if (!this.dispatchEvent(selectEvent)) event.preventDefault();
  }

  // moz-button doesn't forward aria-label, so a step's name rides along as
  // visually-hidden slotted content — except on a compact end, where the
  // button's own `icon-only` label is the accessible name.
  #step(page: number, text: string, name: string, rel?: 'prev' | 'next') {
    const current = !rel && page === this.page;
    const disabled = page < 1 || page > this.#numPages;
    const href = disabled ? undefined : this.hrefForPage?.(page);
    const chevron = rel === 'prev' ? 'chevron-left' : 'chevron-right';
    const iconOnly = !!rel && this.compact;
    return html`<li class=${rel ? 'end' : 'number'}>
      <moz-button
        variant=${current ? 'primary' : 'ghost'}
        current=${ifDefined(current ? 'page' : undefined)}
        icon-only=${ifDefined(iconOnly ? name : undefined)}
        icon-start=${ifDefined(rel === 'prev' || iconOnly ? chevron : undefined)}
        icon-end=${ifDefined(rel === 'next' && !iconOnly ? chevron : undefined)}
        href=${ifDefined(href)}
        rel=${ifDefined(rel)}
        ?disabled=${disabled}
        @click=${(event: MouseEvent) => this.#select(page, event)}
      >
        ${
          iconOnly
            ? nothing
            : html`<span class="visually-hidden">${name}</span>
                <span aria-hidden="true">${text}</span>`
        }
      </moz-button>
    </li>`;
  }

  #ellipsis() {
    return html`<li class="skip" aria-hidden="true">…</li>`;
  }

  render() {
    const numPages = this.#numPages;
    if (numPages <= 1) return nothing;

    const pages = pageWindow(this.page, numPages, this.#slots);
    return html`
      <nav aria-label=${this.label}>
        <ol role="list">
          ${this.#step(this.page - 1, this.previousLabel, this.previousLabel, 'prev')}
          ${pages.map(
            (page, i) => html`
              ${i > 0 && page - pages[i - 1] > 1 ? this.#ellipsis() : nothing}
              ${this.#step(page, String(page), this.pageLabel.replace('{page}', String(page)))}
            `,
          )}
          ${this.#step(this.page + 1, this.nextLabel, this.nextLabel, 'next')}
        </ol>
      </nav>
    `;
  }
}

if (!customElements.get('moz-pagination')) {
  customElements.define('moz-pagination', MozPagination);
}

declare global {
  interface HTMLElementTagNameMap {
    'moz-pagination': MozPagination;
  }
}
