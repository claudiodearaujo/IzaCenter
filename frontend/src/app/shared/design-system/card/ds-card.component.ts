import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type DsCardPadding = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ds-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="ds-card"
      [class.ds-card--interactive]="interactive"
      [class.ds-card--sm]="padding === 'sm'"
      [class.ds-card--md]="padding === 'md'"
      [class.ds-card--lg]="padding === 'lg'">
      <div class="ds-card__header"><ng-content select="[dsCardHeader]" /></div>
      <div class="ds-card__body"><ng-content /></div>
      <div class="ds-card__footer"><ng-content select="[dsCardFooter]" /></div>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .ds-card {
      overflow: hidden;
      color: var(--text-primary);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-xs);
      transition:
        border-color var(--motion-normal) var(--ease-standard),
        box-shadow var(--motion-normal) var(--ease-standard),
        transform var(--motion-normal) var(--ease-standard);
    }

    .ds-card--interactive:hover {
      border-color: var(--border-strong);
      box-shadow: var(--shadow-sm);
      transform: translateY(-1px);
    }

    .ds-card--sm .ds-card__body { padding: 16px; }
    .ds-card--md .ds-card__body { padding: 20px; }
    .ds-card--lg .ds-card__body { padding: 24px; }

    .ds-card__header:empty,
    .ds-card__footer:empty { display: none; }

    .ds-card__header {
      padding: 20px 20px 0;
    }

    .ds-card__footer {
      padding: 0 20px 20px;
    }
  `]
})
export class DsCardComponent {
  @Input() padding: DsCardPadding = 'md';
  @Input() interactive = false;
}
