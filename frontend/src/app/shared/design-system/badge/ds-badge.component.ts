import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type DsBadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'ds-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="ds-badge" [class]="badgeClasses">
      @if (dot) {
        <span class="ds-badge__dot" aria-hidden="true"></span>
      }
      <ng-content />
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }

    .ds-badge {
      display: inline-flex;
      min-height: 24px;
      align-items: center;
      gap: 6px;
      padding: 3px 9px;
      border-radius: var(--radius-pill);
      font-size: 12px;
      font-weight: 600;
      line-height: 16px;
      white-space: nowrap;
    }

    .ds-badge__dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .ds-badge--neutral { color: var(--text-secondary); background: var(--surface-secondary); }
    .ds-badge--brand { color: var(--brand-800); background: var(--brand-100); }
    .ds-badge--success { color: var(--success); background: var(--success-bg); }
    .ds-badge--warning { color: var(--warning); background: var(--warning-bg); }
    .ds-badge--error { color: var(--error); background: var(--error-bg); }
    .ds-badge--info { color: var(--info); background: var(--info-bg); }
  `]
})
export class DsBadgeComponent {
  @Input() tone: DsBadgeTone = 'neutral';
  @Input() dot = false;

  get badgeClasses(): string {
    return `ds-badge ds-badge--${this.tone}`;
  }
}
