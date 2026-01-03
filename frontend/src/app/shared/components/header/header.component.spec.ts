import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { signal } from '@angular/core';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let cartServiceSpy: jasmine.SpyObj<CartService>;

  beforeEach(async () => {
    // Create signals for mocking
    const isAuthenticatedSignal = signal(false);
    const isAdminSignal = signal(false);
    const currentUserSignal = signal(null);
    const cartItemCountSignal = signal(0);

    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      isAuthenticated: isAuthenticatedSignal,
      isAdmin: isAdminSignal,
      currentUser: currentUserSignal,
    });

    cartServiceSpy = jasmine.createSpyObj('CartService', [], {
      itemCount: cartItemCountSignal,
    });

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: CartService, useValue: cartServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('menu toggle', () => {
    it('should toggle menu state', () => {
      expect(component.isMenuOpen()).toBeFalse();
      
      component.toggleMenu();
      expect(component.isMenuOpen()).toBeTrue();
      
      component.toggleMenu();
      expect(component.isMenuOpen()).toBeFalse();
    });

    it('should close menu', () => {
      component.isMenuOpen.set(true);
      component.closeMenu();
      expect(component.isMenuOpen()).toBeFalse();
    });
  });

  describe('logout', () => {
    it('should call authService logout and close menu', () => {
      component.isMenuOpen.set(true);
      
      component.logout();
      
      expect(authServiceSpy.logout).toHaveBeenCalled();
      expect(component.isMenuOpen()).toBeFalse();
    });
  });

  describe('computed properties', () => {
    it('should reflect authentication state', () => {
      expect(component.isAuthenticated()).toBeFalse();
    });

    it('should reflect admin state', () => {
      expect(component.isAdmin()).toBeFalse();
    });

    it('should reflect cart item count', () => {
      expect(component.cartItemCount()).toBe(0);
    });
  });
});
