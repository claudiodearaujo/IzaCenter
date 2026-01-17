import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('frontend');
  private translate = inject(TranslateService);

  ngOnInit(): void {
    // Configure available languages
    this.translate.addLangs(['pt-BR', 'en', 'es', 'fr']);

    // Set default language
    this.translate.setDefaultLang('pt-BR');

    // Detect language: localStorage > browser > default
    const savedLang = localStorage.getItem('language');

    if (savedLang) {
      // Use saved language from localStorage
      this.translate.use(savedLang);
    } else {
      // Auto-detect browser language
      const browserLang = this.translate.getBrowserLang();
      const supportedLangs = ['pt-BR', 'en', 'es', 'fr'];

      // Check if browser language matches or contains supported language
      let detectedLang = 'pt-BR'; // default

      if (browserLang) {
        // Check for exact match first (e.g., 'pt-BR')
        if (supportedLangs.includes(browserLang)) {
          detectedLang = browserLang;
        }
        // Check for partial match (e.g., 'pt' matches 'pt-BR')
        else if (browserLang.startsWith('pt')) {
          detectedLang = 'pt-BR';
        } else if (browserLang.startsWith('en')) {
          detectedLang = 'en';
        } else if (browserLang.startsWith('es')) {
          detectedLang = 'es';
        } else if (browserLang.startsWith('fr')) {
          detectedLang = 'fr';
        }
      }

      this.translate.use(detectedLang);
      // Save detected language to localStorage
      localStorage.setItem('language', detectedLang);
    }
  }
}
