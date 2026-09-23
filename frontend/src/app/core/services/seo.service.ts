import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { PublicSettings } from './settings.service';

export interface SeoMetaData {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
}

export interface SchemaMarkup {
  '@context'?: string;
  '@type': string;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly titleService = inject(Title);
  private readonly document = inject(DOCUMENT);

  private publicSettings?: PublicSettings;

  private get baseUrl(): string {
    return this.document.location?.origin || 'https://www.example.com';
  }

  private get siteName(): string {
    return this.publicSettings?.siteName || 'Therapist Platform';
  }

  private get defaultImage(): string {
    return this.publicSettings?.logoUrl || `${this.baseUrl}/assets/images/og-image.jpg`;
  }

  configure(settings: PublicSettings): void {
    this.publicSettings = settings;

    if (settings.faviconUrl) {
      let favicon = this.document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!favicon) {
        favicon = this.document.createElement('link');
        favicon.rel = 'icon';
        this.document.head.appendChild(favicon);
      }
      favicon.href = settings.faviconUrl;
    }
  }

  /**
   * Set meta tags for a page
   */
  setMeta(data: SeoMetaData): void {
    const title = data.title ? `${data.title} | ${this.siteName}` : this.siteName;
    const description = data.description || '';
    const image = data.image || this.defaultImage;
    const url = data.url || this.baseUrl;
    const type = data.type || 'website';

    // Basic meta tags
    this.titleService.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });

    if (data.keywords) {
      this.meta.updateTag({ name: 'keywords', content: data.keywords });
    }

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: type });

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    // Canonical URL
    this.updateCanonicalUrl(url);
  }

  /**
   * Set JSON-LD structured data schema
   */
  setSchema(schema: SchemaMarkup | SchemaMarkup[]): void {
    // Remove existing schema script if any
    this.removeSchema();

    const schemaData = Array.isArray(schema) ? schema : [schema];

    // Add @context to each schema if not present
    const enrichedSchema = schemaData.map(s => ({
      '@context': 'https://schema.org',
      ...s
    }));

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'seo-schema';
    script.text = JSON.stringify(enrichedSchema.length === 1 ? enrichedSchema[0] : enrichedSchema);
    this.document.head.appendChild(script);
  }

  /**
   * Remove existing schema script
   */
  removeSchema(): void {
    const existingScript = this.document.getElementById('seo-schema');
    if (existingScript) {
      existingScript.remove();
    }
  }

  /**
   * Update canonical URL
   */
  private updateCanonicalUrl(url: string): void {
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  /**
   * Generate Organization schema (for home page)
   */
  getOrganizationSchema(): SchemaMarkup {
    const contact = this.publicSettings?.contact;
    const sameAs = [contact?.instagram, contact?.facebook, contact?.youtube, contact?.tiktok]
      .filter((url): url is string => !!url);

    return {
      '@type': 'Organization',
      'name': this.siteName,
      'url': this.baseUrl,
      'logo': this.publicSettings?.logoUrl || this.defaultImage,
      'description': this.publicSettings?.siteDescription || this.publicSettings?.seo?.metaDescription || '',
      ...(sameAs.length ? { sameAs } : {}),
      'contactPoint': {
        '@type': 'ContactPoint',
        'contactType': 'customer service',
        ...(contact?.email ? { email: contact.email } : {}),
        ...(contact?.phone ? { telephone: contact.phone } : {}),
        'availableLanguage': this.publicSettings?.professional?.languages || ['pt-BR']
      }
    };
  }

  /**
   * Generate Person schema (for about page)
   */
  getPersonSchema(): SchemaMarkup {
    const professional = this.publicSettings?.professional;
    return {
      '@type': 'Person',
      'name': professional?.displayName || 'Profissional',
      'jobTitle': professional?.professionalTitle || 'Profissional de atendimento',
      'description': professional?.bio || this.publicSettings?.siteDescription || '',
      'url': `${this.baseUrl}/sobre`,
      'image': professional?.photoUrl || this.publicSettings?.logoUrl || this.defaultImage,
      'knowsLanguage': professional?.languages || ['pt-BR'],
      ...(professional?.location ? { 'homeLocation': professional.location } : {})
    };
  }

  /**
   * Generate WebSite schema (for home page)
   */
  getWebSiteSchema(): SchemaMarkup {
    return {
      '@type': 'WebSite',
      'name': this.siteName,
      'url': this.baseUrl,
      'description': this.publicSettings?.siteDescription || this.publicSettings?.seo?.metaDescription || '',
      'inLanguage': this.publicSettings?.professional?.languages || ['pt-BR']
    };
  }

  /**
   * Generate FAQPage schema
   */
  getFaqPageSchema(faqs: Array<{ question: string; answer: string }>): SchemaMarkup {
    return {
      '@type': 'FAQPage',
      'mainEntity': faqs.map(faq => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer
        }
      }))
    };
  }

  /**
   * Generate Product schema
   */
  getProductSchema(product: {
    name: string;
    description: string;
    price: number;
    currency?: string;
    image?: string;
    slug: string;
  }): SchemaMarkup {
    return {
      '@type': 'Product',
      'name': product.name,
      'description': product.description,
      'image': product.image || this.defaultImage,
      'url': `${this.baseUrl}/loja/${product.slug}`,
      'offers': {
        '@type': 'Offer',
        'price': product.price,
        'priceCurrency': product.currency || 'BRL',
        'availability': 'https://schema.org/InStock'
      }
    };
  }

  /**
   * Generate BreadcrumbList schema
   */
  getBreadcrumbSchema(items: Array<{ name: string; url: string }>): SchemaMarkup {
    return {
      '@type': 'BreadcrumbList',
      'itemListElement': items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': item.url.startsWith('http') ? item.url : `${this.baseUrl}${item.url}`
      }))
    };
  }

  /**
   * Generate Service schema
   */
  getServiceSchema(services: Array<{ name: string; description: string }>): SchemaMarkup {
    const professional = this.publicSettings?.professional;
    return {
      '@type': 'Service',
      'provider': {
        '@type': 'Person',
        'name': professional?.displayName || 'Profissional'
      },
      'serviceType': 'Serviços profissionais',
      'areaServed': professional?.serviceMode === 'ONLINE' ? 'Worldwide' : (professional?.location || 'Local'),
      'hasOfferCatalog': {
        '@type': 'OfferCatalog',
        'name': `${this.siteName} - Serviços`,
        'itemListElement': services.map(service => ({
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            'name': service.name,
            'description': service.description
          }
        }))
      }
    };
  }
}
