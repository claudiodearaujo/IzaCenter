import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent, RouterTestingModule],
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
    it('should have 5 quick links', () => {
      expect(component.quickLinks.length).toBe(5);
    });

    it('should include home link', () => {
      const home = component.quickLinks.find(l => l.route === '/');
      expect(home).toBeTruthy();
      expect(home?.label).toBe('Início');
    });

    it('should include shop link', () => {
      const shop = component.quickLinks.find(l => l.route === '/loja');
      expect(shop).toBeTruthy();
      expect(shop?.label).toBe('Loja');
    });
  });

  describe('legalLinks', () => {
    it('should have 3 legal links', () => {
      expect(component.legalLinks.length).toBe(3);
    });

    it('should include terms link', () => {
      const terms = component.legalLinks.find(l => l.route === '/termos');
      expect(terms).toBeTruthy();
      expect(terms?.label).toBe('Termos de Uso');
    });

    it('should include privacy link', () => {
      const privacy = component.legalLinks.find(l => l.route === '/privacidade');
      expect(privacy).toBeTruthy();
      expect(privacy?.label).toBe('Política de Privacidade');
    });

    it('should include FAQ link', () => {
      const faq = component.legalLinks.find(l => l.route === '/faq');
      expect(faq).toBeTruthy();
      expect(faq?.label).toBe('FAQ');
    });
  });
});
