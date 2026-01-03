import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestimonialCardComponent, Testimonial } from './testimonial-card.component';

describe('TestimonialCardComponent', () => {
  let component: TestimonialCardComponent;
  let fixture: ComponentFixture<TestimonialCardComponent>;

  const mockTestimonial: Testimonial = {
    id: '1',
    clientName: 'Maria Silva',
    content: 'Excelente atendimento!',
    rating: 5,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestimonialCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestimonialCardComponent);
    component = fixture.componentInstance;
    component.testimonial = mockTestimonial;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('stars', () => {
    it('should return array with rating length', () => {
      component.testimonial = { ...mockTestimonial, rating: 5 };
      expect(component.stars.length).toBe(5);
    });

    it('should return 5 stars when no rating provided', () => {
      component.testimonial = { ...mockTestimonial, rating: undefined };
      expect(component.stars.length).toBe(5);
    });

    it('should return correct number of stars for different ratings', () => {
      component.testimonial = { ...mockTestimonial, rating: 3 };
      expect(component.stars.length).toBe(3);

      component.testimonial = { ...mockTestimonial, rating: 1 };
      expect(component.stars.length).toBe(1);
    });
  });

  describe('initials', () => {
    it('should return first letter of first and last name', () => {
      component.testimonial = { ...mockTestimonial, clientName: 'Maria Silva' };
      expect(component.initials).toBe('MS');
    });

    it('should return single initial for single name', () => {
      component.testimonial = { ...mockTestimonial, clientName: 'Ana' };
      expect(component.initials).toBe('A');
    });

    it('should return first two initials for multiple names', () => {
      component.testimonial = { ...mockTestimonial, clientName: 'João Carlos Oliveira Santos' };
      expect(component.initials).toBe('JC');
    });

    it('should return uppercase initials', () => {
      component.testimonial = { ...mockTestimonial, clientName: 'ana beatriz' };
      expect(component.initials).toBe('AB');
    });
  });

  describe('clientAvatarUrl', () => {
    it('should accept optional avatar URL', () => {
      component.testimonial = {
        ...mockTestimonial,
        clientAvatarUrl: 'https://example.com/avatar.jpg',
      };
      expect(component.testimonial.clientAvatarUrl).toBe('https://example.com/avatar.jpg');
    });

    it('should work without avatar URL', () => {
      component.testimonial = { ...mockTestimonial, clientAvatarUrl: undefined };
      expect(component.testimonial.clientAvatarUrl).toBeUndefined();
    });
  });
});
