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
    this.translate.addLangs(['pt-BR', 'en', 'es']);

    // Set default language
    this.translate.setDefaultLang('pt-BR');

    // Get saved language from localStorage or use default
    const savedLang = localStorage.getItem('language') || 'pt-BR';
    this.translate.use(savedLang);
  }
}
