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

  languages: Language[] = [
    { code: 'pt-BR', name: 'Português', flag: 'br' },
    { code: 'en', name: 'English', flag: 'us' },
    { code: 'es', name: 'Español', flag: 'es' },
    { code: 'fr', name: 'Français', flag: 'fr' }
  ];

  selectedLanguageCode: string;

  constructor() {
    this.selectedLanguageCode = this.translate.currentLang || 'pt-BR';
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
    return current?.name || 'Português';
  }
}
