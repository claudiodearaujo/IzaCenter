import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ds-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="ds-empty-state">
      <div class="ds-empty-state__icon" aria-hidden="true">
        <i class="pi" [class]="icon"></i>
      </div>
      <h2 class="ds-empty-state__title">{{ title }}</h2>
      @if (description) {
        <p class="ds-empty-state__description">{{ description }}</p>
      }
      <div class="ds-empty-state__actions">
        <ng-content select="[dsEmptyActions]" />
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .ds-empty-state {
      display: flex;
      min-height: 240px;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
      text-align: center;
      background: var(--surface);
      border: 1px dashed var(--border-strong);
      border-radius: var(--radius-lg);
    }

    .ds-empty-state__icon {
      display: inline-flex;
      width: 48px;
      height: 48px;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      border-radius: 50%;
      color: var(--brand-700);
      background: var(--brand-100);
      font-size: 20px;
    }

    .ds-empty-state__title {
      margin: 0;
      color: var(--text-primary);
      font-size: 18px;
      font-weight: 600;
      line-height: 26px;
    }

    .ds-empty-state__description {
      max-width: 520px;
      margin: 6px 0 0;
      color: var(--text-secondary);
      font-size: 14px;
      line-height: 21px;
    }

    .ds-empty-state__actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
      margin-top: 18px;
    }

    .ds-empty-state__actions:empty { display: none; }
  `]
})
export class DsEmptyStateComponent {
  @Input({ required: true }) title = '';
  @Input() description = '';
  @Input() icon = 'pi-inbox';
}
