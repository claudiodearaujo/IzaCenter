import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

interface Language {
  code: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  template: `
    <div class="relative inline-block">
      <select
        [(ngModel)]="selectedLanguageCode"
        (change)="onLanguageChange()"
        class="appearance-none bg-white border border-neutral-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer min-w-[140px]">
        @for (language of languages; track language.code) {
          <option [value]="language.code">
            {{ language.flag }} {{ language.name }}
          </option>
        }
      </select>
      <span class="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 text-xs pointer-events-none">▼</span>
    </div>
  `,
  styles: [`
    select {
      background-image: none;
      padding-right: 28px;
    }
  `]
})
export class LanguageSelectorComponent {
  private translate = inject(TranslateService);

  languages: Language[] = [
    { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  selectedLanguageCode: string;

  constructor() {
    this.selectedLanguageCode = this.translate.currentLang || 'pt-BR';
  }

  onLanguageChange(): void {
    if (this.selectedLanguageCode) {
      this.translate.use(this.selectedLanguageCode);
      localStorage.setItem('language', this.selectedLanguageCode);
    }
  }
}
