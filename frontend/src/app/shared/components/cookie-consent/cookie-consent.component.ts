import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

const COOKIE_CONSENT_KEY = 'iza_cookie_consent';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TranslateModule],
  templateUrl: './cookie-consent.component.html',
  styleUrl: './cookie-consent.component.css'
})
export class CookieConsentComponent implements OnInit {
  visible = signal(false);

  ngOnInit(): void {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Delay slightly so it doesn't flash on first render
      setTimeout(() => this.visible.set(true), 800);
    }
  }

  accept(): void {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    this.visible.set(false);
  }

  decline(): void {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    this.visible.set(false);
  }
}
