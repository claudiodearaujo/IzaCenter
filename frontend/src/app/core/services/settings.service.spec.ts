import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SettingsService, GeneralSettings, ContactSettings, ContentSettings, ProfessionalSettings, SpecialtySettings } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let httpMock: HttpTestingController;

  const mockGeneralSettings: GeneralSettings = {
    siteName: 'Therapist Platform',
    siteDescription: 'Tarô e Ayurveda',
    enableShop: true,
    enableAppointments: true,
    enableTestimonials: true,
    maintenanceMode: false,
  };

  const mockContactSettings: ContactSettings = {
    email: 'contato@profissional.com',
    phone: '31999999999',
    whatsapp: '31999999999',
    instagram: 'profissional',
  };

  const mockContentSettings: ContentSettings = {
    heroTitle: 'Bem-vindo',
    heroSubtitle: 'Descubra seu caminho',
    aboutTitle: 'Sobre',
    aboutContent: 'Conheça nossa história',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SettingsService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(SettingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPublicSettings', () => {
    it('should return public settings', () => {
      const mockResponse = {
        data: {
          siteName: 'Therapist Platform',
          siteDescription: 'Serviços e atendimentos profissionais',
          enableShop: true,
          enableAppointments: true,
          enableTestimonials: true,
          contact: mockContactSettings,
          heroTitle: 'Bem-vindo',
          heroSubtitle: 'Descubra seu caminho',
        },
        success: true,
      };

      service.getPublicSettings().subscribe(response => {
        expect(response.data.siteName).toBe('Therapist Platform');
      });

      const req = httpMock.expectOne('/api/settings/public');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getAll (admin)', () => {
    it('should return all settings', () => {
      const mockResponse = {
        data: {
          general: mockGeneralSettings,
          contact: mockContactSettings,
          businessHours: [],
          content: mockContentSettings,
          analytics: {},
        },
        success: true,
      };

      service.getAll().subscribe(response => {
        expect(response.data.general).toEqual(mockGeneralSettings);
      });

      const req = httpMock.expectOne('/api/admin/settings');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('generic domain settings', () => {
    it('should update professional settings', () => {
      const data: ProfessionalSettings = {
        displayName: 'Profissional',
        professionalTitle: 'Terapeuta integrativo',
        languages: ['pt-BR'],
        serviceMode: 'ONLINE',
        credentials: [],
      };

      service.updateProfessional(data).subscribe(response => {
        expect(response.data.professionalTitle).toBe('Terapeuta integrativo');
      });

      const req = httpMock.expectOne('/api/admin/settings/professional');
      expect(req.request.method).toBe('PUT');
      req.flush({ data, success: true });
    });

    it('should update specialties', () => {
      const data: SpecialtySettings[] = [
        { slug: 'reiki', name: 'Reiki', isActive: true, usesCardModule: false },
      ];

      service.updateSpecialties(data).subscribe(response => {
        expect(response.data[0].slug).toBe('reiki');
      });

      const req = httpMock.expectOne('/api/admin/settings/specialties');
      expect(req.request.method).toBe('PUT');
      req.flush({ data, success: true });
    });
  });

  describe('getGeneral', () => {
    it('should return general settings', () => {
      const mockResponse = { data: mockGeneralSettings, success: true };

      service.getGeneral().subscribe(response => {
        expect(response.data).toEqual(mockGeneralSettings);
      });

      const req = httpMock.expectOne('/api/admin/settings/general');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('updateGeneral', () => {
    it('should update general settings', () => {
      const updateData = { siteName: 'Novo Nome' };
      const mockResponse = { data: { ...mockGeneralSettings, ...updateData }, success: true };

      service.updateGeneral(updateData).subscribe(response => {
        expect(response.data.siteName).toBe('Novo Nome');
      });

      const req = httpMock.expectOne('/api/admin/settings/general');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
    });
  });

  describe('getContact', () => {
    it('should return contact settings', () => {
      const mockResponse = { data: mockContactSettings, success: true };

      service.getContact().subscribe(response => {
        expect(response.data).toEqual(mockContactSettings);
      });

      const req = httpMock.expectOne('/api/admin/settings/contact');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('updateContact', () => {
    it('should update contact settings', () => {
      const updateData = { email: 'novo@email.com' };
      const mockResponse = { data: { ...mockContactSettings, ...updateData }, success: true };

      service.updateContact(updateData).subscribe(response => {
        expect(response.data.email).toBe('novo@email.com');
      });

      const req = httpMock.expectOne('/api/admin/settings/contact');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
    });
  });
});
