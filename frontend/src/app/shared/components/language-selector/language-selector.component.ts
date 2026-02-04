import { Component, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

interface Language {
  code: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.css'
})
export class LanguageSelectorComponent {
  private translate = inject(TranslateService);
  private elementRef = inject(ElementRef);

  isOpen = false;

  languages: Language[] = [];
  selectedLanguageCode: string;

  constructor() {
    this.selectedLanguageCode = this.translate.currentLang || 'pt-BR';
    this.initializeLanguages();
  }

  private initializeLanguages(): void {
    this.languages = [
      { code: 'pt-BR', name: this.translate.instant('languages.portuguese'), flag: 'br' },
      { code: 'en', name: this.translate.instant('languages.english'), flag: 'us' },
      { code: 'es', name: this.translate.instant('languages.spanish'), flag: 'es' },
      { code: 'fr', name: this.translate.instant('languages.french'), flag: 'fr' }
    ];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  selectLanguage(code: string): void {
    this.selectedLanguageCode = code;
    this.translate.use(code);
    localStorage.setItem('language', code);
    this.closeDropdown();
  }

  getCurrentFlag(): string {
    const current = this.languages.find(l => l.code === this.selectedLanguageCode);
    return current?.flag || 'br';
  }

  getCurrentLanguageName(): string {
    const current = this.languages.find(l => l.code === this.selectedLanguageCode);
    return current?.name || this.translate.instant('languages.portuguese');
  }
}
