import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { CookieConsentComponent } from './cookie-consent.component';

class FakeTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      cookies: {
        message: 'We use cookies',
        privacyLink: 'Privacy Policy',
        accept: 'Accept',
        decline: 'Decline',
      },
    });
  }
}

describe('CookieConsentComponent', () => {
  let component: CookieConsentComponent;
  let fixture: ComponentFixture<CookieConsentComponent>;

  beforeEach(async () => {
    localStorage.removeItem('iza_cookie_consent');

    await TestBed.configureTestingModule({
      imports: [
        CookieConsentComponent,
        RouterTestingModule,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: FakeTranslateLoader } }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CookieConsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('iza_cookie_consent');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be visible immediately on creation', () => {
    expect(component.visible()).toBeFalse();
  });

  it('should become visible after 800ms if no consent stored', fakeAsync(() => {
    component.ngOnInit(); // re-trigger inside fakeAsync zone
    tick(800);
    expect(component.visible()).toBeTrue();
  }));

  it('should not become visible if consent already given', fakeAsync(() => {
    localStorage.setItem('iza_cookie_consent', 'accepted');
    component.ngOnInit();
    tick(800);
    expect(component.visible()).toBeFalse();
  }));

  it('should accept cookies and hide banner', () => {
    component.visible.set(true);
    component.accept();

    expect(component.visible()).toBeFalse();
    expect(localStorage.getItem('iza_cookie_consent')).toBe('accepted');
  });

  it('should decline cookies and hide banner', () => {
    component.visible.set(true);
    component.decline();

    expect(component.visible()).toBeFalse();
    expect(localStorage.getItem('iza_cookie_consent')).toBe('declined');
  });
});
