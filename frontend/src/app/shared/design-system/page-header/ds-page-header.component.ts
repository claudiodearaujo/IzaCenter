import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ds-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="ds-page-header">
      <div class="ds-page-header__content">
        @if (eyebrow) {
          <p class="ds-page-header__eyebrow">{{ eyebrow }}</p>
        }
        <h1 class="ds-page-header__title">{{ title }}</h1>
        @if (description) {
          <p class="ds-page-header__description">{{ description }}</p>
        }
      </div>
      <div class="ds-page-header__actions">
        <ng-content select="[dsPageActions]" />
      </div>
    </header>
  `,
  styles: [`
    :host { display: block; }

    .ds-page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 24px;
    }

    .ds-page-header__content { min-width: 0; }

    .ds-page-header__eyebrow {
      margin: 0 0 4px;
      color: var(--brand-700);
      font-size: 12px;
      font-weight: 700;
      line-height: 16px;
      letter-spacing: .06em;
      text-transform: uppercase;
    }

    .ds-page-header__title {
      margin: 0;
      color: var(--text-primary);
      font-size: 32px;
      font-weight: 600;
      line-height: 40px;
      letter-spacing: -.02em;
    }

    .ds-page-header__description {
      max-width: 720px;
      margin: 6px 0 0;
      color: var(--text-secondary);
      font-size: 14px;
      line-height: 21px;
    }

    .ds-page-header__actions {
      display: flex;
      flex: 0 0 auto;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }

    .ds-page-header__actions:empty { display: none; }

    @media (max-width: 639px) {
      .ds-page-header { flex-direction: column; gap: 16px; }
      .ds-page-header__title { font-size: 28px; line-height: 36px; }
      .ds-page-header__actions { width: 100%; }
    }
  `]
})
export class DsPageHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() description = '';
  @Input() eyebrow = '';
}
