import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ProductCardComponent } from './product-card.component';
import { Product } from '../../../core/models/product.model';
import { CurrencyBrlPipe } from '../../pipes/currency-brl.pipe';

describe('ProductCardComponent', () => {
  let component: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;

  const mockProduct: Product = {
    id: '1',
    name: 'Produto Teste',
    description: 'Descrição do produto',
    price: 99.90,
    slug: 'produto-teste',
    imageUrl: 'https://example.com/image.jpg',
    isActive: true,
    isFeatured: false,
    categoryId: 'cat-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent, RouterTestingModule, CurrencyBrlPipe],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
    component.product = mockProduct;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('hasDiscount', () => {
    it('should return false when no original price', () => {
      component.product = { ...mockProduct, originalPrice: undefined };
      expect(component.hasDiscount).toBeFalse();
    });

    it('should return false when original price equals current price', () => {
      component.product = { ...mockProduct, originalPrice: 99.90 };
      expect(component.hasDiscount).toBeFalse();
    });

    it('should return true when original price is greater than current price', () => {
      component.product = { ...mockProduct, price: 79.90, originalPrice: 99.90 };
      expect(component.hasDiscount).toBeTrue();
    });
  });

  describe('discountPercentage', () => {
    it('should return 0 when no discount', () => {
      component.product = { ...mockProduct, originalPrice: undefined };
      expect(component.discountPercentage).toBe(0);
    });

    it('should calculate correct discount percentage', () => {
      component.product = { ...mockProduct, price: 80, originalPrice: 100 };
      expect(component.discountPercentage).toBe(20);
    });

    it('should round discount percentage', () => {
      component.product = { ...mockProduct, price: 75, originalPrice: 99.90 };
      const percentage = component.discountPercentage;
      expect(Math.floor(percentage)).toBe(Math.floor((1 - 75 / 99.90) * 100));
    });
  });

  describe('onAddToCart', () => {
    it('should emit addToCart event with product', () => {
      spyOn(component.addToCart, 'emit');
      const event = new MouseEvent('click');
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopPropagation');

      component.onAddToCart(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.addToCart.emit).toHaveBeenCalledWith(mockProduct);
    });
  });
});
