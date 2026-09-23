import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type DsButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type DsButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ds-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [attr.type]="type"
      [attr.aria-label]="ariaLabel || null"
      [attr.aria-busy]="loading ? 'true' : null"
      [disabled]="disabled || loading"
      [class]="buttonClasses">
      @if (loading) {
        <i class="pi pi-spinner pi-spin ds-button__icon" aria-hidden="true"></i>
      } @else if (icon) {
        <i class="pi ds-button__icon" [class]="icon" aria-hidden="true"></i>
      }
      <span class="ds-button__label"><ng-content /></span>
    </button>
  `,
  styles: [`
    :host { display: inline-flex; }

    .ds-button {
      appearance: none;
      display: inline-flex;
      min-height: 40px;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      font: inherit;
      font-weight: 600;
      line-height: 1;
      cursor: pointer;
      transition:
        background-color var(--motion-fast) var(--ease-standard),
        border-color var(--motion-fast) var(--ease-standard),
        color var(--motion-fast) var(--ease-standard),
        box-shadow var(--motion-fast) var(--ease-standard),
        transform var(--motion-fast) var(--ease-standard);
    }

    .ds-button:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px rgba(71, 119, 98, 0.16);
    }

    .ds-button:active:not(:disabled) { transform: translateY(1px); }
    .ds-button:disabled { cursor: not-allowed; opacity: .55; }

    .ds-button--sm { min-height: 36px; padding: 0 12px; font-size: 13px; }
    .ds-button--md { min-height: 40px; padding: 0 16px; font-size: 14px; }
    .ds-button--lg { min-height: 44px; padding: 0 18px; font-size: 15px; }

    .ds-button--primary {
      color: var(--text-inverse);
      background: var(--brand-600);
      border-color: var(--brand-600);
    }
    .ds-button--primary:hover:not(:disabled) {
      background: var(--brand-700);
      border-color: var(--brand-700);
    }

    .ds-button--secondary {
      color: var(--text-primary);
      background: var(--surface);
      border-color: var(--border-strong);
    }
    .ds-button--secondary:hover:not(:disabled) {
      background: var(--surface-secondary);
      border-color: var(--border-strong);
    }

    .ds-button--ghost {
      color: var(--text-secondary);
      background: transparent;
    }
    .ds-button--ghost:hover:not(:disabled) {
      color: var(--text-primary);
      background: var(--surface-secondary);
    }

    .ds-button--danger {
      color: #fff;
      background: var(--error);
      border-color: var(--error);
    }
    .ds-button--danger:hover:not(:disabled) {
      filter: brightness(.92);
    }

    .ds-button--full { width: 100%; }
    .ds-button__icon { font-size: 1rem; }
    .ds-button__label { display: inline-flex; align-items: center; }
  `]
})
export class DsButtonComponent {
  @Input() variant: DsButtonVariant = 'primary';
  @Input() size: DsButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() icon = '';
  @Input() ariaLabel = '';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;

  get buttonClasses(): string {
    return [
      'ds-button',
      `ds-button--${this.variant}`,
      `ds-button--${this.size}`,
      this.fullWidth ? 'ds-button--full' : ''
    ].filter(Boolean).join(' ');
  }
}
