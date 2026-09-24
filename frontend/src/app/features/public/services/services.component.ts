import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { ProductsService, Product } from '../../../core/services/products.service';
import { SeoService } from '../../../core/services/seo.service';
import { DEFAULT_PUBLIC_SETTINGS, PublicSettingsStore } from '../../../core/services/public-settings.store';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink, SkeletonModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css',
})
export class ServicesComponent implements OnInit {
  private productsService = inject(ProductsService);
  private publicSettingsStore = inject(PublicSettingsStore);
  private seoService = inject(SeoService);

  publicSettings = signal(DEFAULT_PUBLIC_SETTINGS);
  services = signal<Product[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.publicSettingsStore.load().subscribe((settings) => {
      this.publicSettings.set(settings);
      this.seoService.configure(settings);
      this.seoService.setMeta({
        title: settings.content.servicesTitle || 'Serviços',
        description: settings.content.servicesSubtitle || settings.siteDescription,
        keywords: settings.seo.keywords.join(', '),
        url: window.location.origin + '/servicos',
      });
    });

    this.productsService.findAll({ page: 1, limit: 50 }).subscribe({
      next: (response) => {
        const active = response.data.filter((service) => service.isActive);
        this.services.set(active);
        this.loading.set(false);
        this.seoService.setSchema([
          this.seoService.getServiceSchema(
            active.map((service) => ({
              name: service.name,
              description: service.shortDescription || service.fullDescription || '',
            }))
          ),
          this.seoService.getBreadcrumbSchema([
            { name: 'Início', url: '/' },
            { name: 'Serviços', url: '/servicos' },
          ]),
        ]);
      },
      error: () => {
        this.services.set([]);
        this.loading.set(false);
      },
    });
  }

  getCapabilityLabels(service: Product): string[] {
    const labels: string[] = [];

    if (service.capabilities?.scheduling?.enabled) {
      const duration = service.capabilities.scheduling.durationMinutes;
      labels.push(duration ? `Agendamento · ${duration} min` : 'Agendamento');
    }

    if (service.capabilities?.digitalDelivery?.enabled) {
      labels.push(
        service.capabilities.digitalDelivery.format
          ? `Entrega digital · ${service.capabilities.digitalDelivery.format}`
          : 'Entrega digital'
      );
    }

    if (service.capabilities?.recurring?.enabled) {
      labels.push(
        service.capabilities.recurring.sessions
          ? `Pacote · ${service.capabilities.recurring.sessions} sessões`
          : 'Acompanhamento recorrente'
      );
    }

    if (service.capabilities?.intake?.enabled) {
      labels.push('Preparação prévia');
    }

    return labels;
  }
}
