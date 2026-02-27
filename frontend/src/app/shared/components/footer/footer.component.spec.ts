import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { FooterComponent } from './footer.component';

class FakeTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FooterComponent,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have current year', () => {
    const currentYear = new Date().getFullYear();
    expect(component.currentYear).toBe(currentYear);
  });

  describe('socialLinks', () => {
    it('should have 3 social links', () => {
      expect(component.socialLinks.length).toBe(3);
    });

    it('should include Instagram link', () => {
      const instagram = component.socialLinks.find(l => l.label === 'Instagram');
      expect(instagram).toBeTruthy();
      expect(instagram?.icon).toBe('pi-instagram');
    });

    it('should include WhatsApp link', () => {
      const whatsapp = component.socialLinks.find(l => l.label === 'WhatsApp');
      expect(whatsapp).toBeTruthy();
      expect(whatsapp?.icon).toBe('pi-whatsapp');
    });

    it('should include Email link', () => {
      const email = component.socialLinks.find(l => l.label === 'Email');
      expect(email).toBeTruthy();
      expect(email?.icon).toBe('pi-envelope');
    });
  });

  describe('quickLinks', () => {
    it('should have quick links', () => {
      expect(component.quickLinks.length).toBeGreaterThan(0);
    });

    it('should include home link', () => {
      const home = component.quickLinks.find(l => l.route === '/');
      expect(home).toBeTruthy();
      expect(home?.labelKey).toBeTruthy();
    });

    it('should include shop link', () => {
      const shop = component.quickLinks.find(l => l.route === '/loja');
      expect(shop).toBeTruthy();
      expect(shop?.labelKey).toBeTruthy();
    });
  });

  describe('legalLinks', () => {
    it('should have 3 legal links', () => {
      expect(component.legalLinks.length).toBe(3);
    });

    it('should include terms link', () => {
      const terms = component.legalLinks.find(l => l.route.includes('termo'));
      expect(terms).toBeTruthy();
      expect(terms?.labelKey).toBeTruthy();
    });

    it('should include privacy link', () => {
      const privacy = component.legalLinks.find(l => l.route.includes('privaci'));
      expect(privacy).toBeTruthy();
      expect(privacy?.labelKey).toBeTruthy();
    });

    it('should include FAQ link', () => {
      const faq = component.legalLinks.find(l => l.route === '/faq');
      expect(faq).toBeTruthy();
      expect(faq?.labelKey).toBeTruthy();
    });
  });
});
