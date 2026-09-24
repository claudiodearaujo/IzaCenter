import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { fadeInUp, listAnimation } from '../../../shared/animations/fade.animation';
import { TestimonialCardComponent, Testimonial } from '../../../shared/components/testimonial-card/testimonial-card.component';
import { SeoService } from '../../../core/services/seo.service';
import { TestimonialsService } from '../../../core/services/testimonials.service';
import { ProductsService, Product } from '../../../core/services/products.service';
import { DEFAULT_PUBLIC_SETTINGS, PublicSettingsStore } from '../../../core/services/public-settings.store';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, SkeletonModule, TestimonialCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [fadeInUp, listAnimation],
})
export class HomeComponent implements OnInit {
  private publicSettingsStore = inject(PublicSettingsStore);
  private productsService = inject(ProductsService);
  private testimonialsService = inject(TestimonialsService);
  private seoService = inject(SeoService);

  publicSettings = signal(DEFAULT_PUBLIC_SETTINGS);
  featuredProducts = signal<Product[]>([]);
  testimonials = signal<Testimonial[]>([]);
  loadingServices = signal(true);
  loadingTestimonials = signal(true);

  professionalImage = computed(() =>
    this.publicSettings().professional.photoUrl ||
    this.publicSettings().logoUrl ||
    'assets/images/professional-profile.svg'
  );

  primarySpecialties = computed(() =>
    this.publicSettings().specialties.slice(0, 3)
  );

  ngOnInit(): void {
    this.publicSettingsStore.load().subscribe((settings) => {
      this.publicSettings.set(settings);
      this.seoService.configure(settings);
      this.seoService.setMeta({
        title: settings.seo.metaTitle || settings.siteName,
        description: settings.seo.metaDescription || settings.siteDescription,
        keywords: settings.seo.keywords.join(', '),
        image: settings.logoUrl,
        url: window.location.origin + '/',
      });
      this.seoService.setSchema([
        this.seoService.getOrganizationSchema(),
        this.seoService.getWebSiteSchema(),
        this.seoService.getPersonSchema(),
      ]);
    });

    this.loadServices();
    this.loadTestimonials();
  }

  private loadServices(): void {
    this.loadingServices.set(true);
    this.productsService.findFeatured(3).subscribe({
      next: (response) => {
        this.featuredProducts.set(response.data.filter((product) => product.isActive));
        this.loadingServices.set(false);
      },
      error: () => {
        this.featuredProducts.set([]);
        this.loadingServices.set(false);
      },
    });
  }

  private loadTestimonials(): void {
    this.loadingTestimonials.set(true);
    this.testimonialsService.findFeatured(3).subscribe({
      next: (response) => {
        this.testimonials.set(
          response.data.map((t) => ({
            id: t.id,
            clientName: t.clientName,
            clientAvatarUrl: t.clientAvatarUrl,
            content: t.content,
            rating: t.rating,
          }))
        );
        this.loadingTestimonials.set(false);
      },
      error: () => {
        this.testimonials.set([]);
        this.loadingTestimonials.set(false);
      },
    });
  }
}
