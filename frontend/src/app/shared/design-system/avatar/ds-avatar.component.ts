import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type DsAvatarSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ds-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="ds-avatar" [class]="avatarClasses" [attr.title]="name || null">
      @if (imageUrl) {
        <img class="ds-avatar__image" [src]="imageUrl" [alt]="alt || name || 'Avatar'" />
      } @else {
        <span aria-hidden="true">{{ initials }}</span>
        <span class="sr-only">{{ name || alt || 'Avatar' }}</span>
      }
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }

    .ds-avatar {
      display: inline-flex;
      flex: 0 0 auto;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border: 1px solid var(--brand-200);
      border-radius: 50%;
      color: var(--brand-800);
      background: var(--brand-100);
      font-weight: 700;
      text-transform: uppercase;
    }

    .ds-avatar--sm { width: 32px; height: 32px; font-size: 11px; }
    .ds-avatar--md { width: 40px; height: 40px; font-size: 13px; }
    .ds-avatar--lg { width: 48px; height: 48px; font-size: 15px; }

    .ds-avatar__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `]
})
export class DsAvatarComponent {
  @Input() name = '';
  @Input() imageUrl = '';
  @Input() alt = '';
  @Input() size: DsAvatarSize = 'md';

  get initials(): string {
    const source = this.name.trim();
    if (!source) return '?';

    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  get avatarClasses(): string {
    return `ds-avatar ds-avatar--${this.size}`;
  }
}
