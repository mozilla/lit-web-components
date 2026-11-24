import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { MozLitElement } from '../../base/moz-lit-element';
import shared from '../../base/shared.css';
import badgeTokens from '../../generated/component-tokens/badge.css';
import buttonTokens from '../../generated/component-tokens/button.css';
import '../moz-icon/moz-icon';
import type { IconName } from '../../generated/icons';
import styles from './moz-status-badge.css';

export type StatusBadgeType =
  | 'default'
  | 'ghost'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'critical'
  | 'information';

export type StatusBadgeSize = 'default' | 'large';

/**
 * Small status pill: like `moz-badge` but xsmall, normal-cased, and 22px tall,
 * with status color types. Colors come from the global status tokens
 * (`--background-color-success`, `--icon-color-success`, and so on). The label
 * goes in the default slot; `icon-start` renders a leading moz-icon, or slot
 * one into `icon` to control it — a status dot is a `notification-fill` icon
 * with its own `color`, which the attribute can't set. Purely presentational.
 *
 * @slot - the badge label.
 * @slot icon - a leading icon, when `icon-start` isn't enough.
 * @csspart badge - the pill container.
 */
export class MozStatusBadge extends MozLitElement {
  static styles = [shared, badgeTokens, buttonTokens, styles];

  /** Status type, selecting the color set. */
  @property({ reflect: true }) type: StatusBadgeType = 'default';

  /** Size step: a 22px pill, or a 32px one with root-size text. */
  @property({ reflect: true }) size: StatusBadgeSize = 'default';

  /** Icon rendered before the label. */
  @property({ attribute: 'icon-start' }) iconStart?: IconName;

  render() {
    return html`
      <span class="badge" part="badge">
        ${
          this.iconStart
            ? html`<moz-icon class="icon" name=${this.iconStart}></moz-icon>`
            : html`<slot name="icon"></slot>`
        }
        <span class="label"><slot></slot></span>
      </span>
    `;
  }
}

if (!customElements.get('moz-status-badge')) {
  customElements.define('moz-status-badge', MozStatusBadge);
}

declare global {
  interface HTMLElementTagNameMap {
    'moz-status-badge': MozStatusBadge;
  }
}
