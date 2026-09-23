import { SettingsService } from './settings.service';
import { prismaMock } from '../../test/mocks/prisma.mock';

describe('SettingsService', () => {
  let settingsService: SettingsService;

  beforeEach(() => {
    settingsService = new SettingsService();
    jest.clearAllMocks();
  });

  // =============================================
  // GET GENERAL
  // =============================================
  describe('getGeneral', () => {
    it('should return general settings', async () => {
      // Arrange
      const mockSetting = {
        id: 'setting-1',
        key: 'general',
        value: { siteName: 'Therapist Platform', enableShop: true },
      };
      prismaMock.siteSetting.findUnique.mockResolvedValue(mockSetting as any);

      // Act
      const result = await settingsService.getGeneral();

      // Assert
      expect(result.data.siteName).toBe('Therapist Platform');
    });

    it('should return defaults if no settings exist', async () => {
      // Arrange
      prismaMock.siteSetting.findUnique.mockResolvedValue(null);

      // Act
      const result = await settingsService.getGeneral();

      // Assert
      expect(result.data.siteName).toBe('Therapist Platform');
      expect(result.data.enableShop).toBe(true);
    });
  });

  // =============================================
  // UPDATE GENERAL
  // =============================================
  describe('updateGeneral', () => {
    it('should update general settings', async () => {
      // Arrange
      prismaMock.siteSetting.findUnique.mockResolvedValue({
        key: 'general',
        value: { siteName: 'Old Name', enableShop: true },
      } as any);
      prismaMock.siteSetting.upsert.mockResolvedValue({} as any);

      // Act
      const result = await settingsService.updateGeneral({ siteName: 'New Name' });

      // Assert
      expect(result.data.siteName).toBe('New Name');
      expect(prismaMock.siteSetting.upsert).toHaveBeenCalled();
    });
  });

  // =============================================
  // GET CONTACT
  // =============================================
  describe('getContact', () => {
    it('should return contact settings', async () => {
      // Arrange
      const mockSetting = {
        key: 'contact',
        value: { email: 'contato@profissional.com', phone: '11999999999' },
      };
      prismaMock.siteSetting.findUnique.mockResolvedValue(mockSetting as any);

      // Act
      const result = await settingsService.getContact();

      // Assert
      expect(result.data.email).toBe('contato@profissional.com');
    });

    it('should return defaults if no settings exist', async () => {
      // Arrange
      prismaMock.siteSetting.findUnique.mockResolvedValue(null);

      // Act
      const result = await settingsService.getContact();

      // Assert
      expect(result.data.email).toBe('');
    });
  });

  // =============================================
  // UPDATE CONTACT
  // =============================================
  describe('updateContact', () => {
    it('should update contact settings', async () => {
      // Arrange
      prismaMock.siteSetting.findUnique.mockResolvedValue({
        key: 'contact',
        value: { email: 'old@email.com' },
      } as any);
      prismaMock.siteSetting.upsert.mockResolvedValue({} as any);

      // Act
      const result = await settingsService.updateContact({ email: 'new@email.com' });

      // Assert
      expect(result.data.email).toBe('new@email.com');
    });
  });

  // =============================================
  // GET BUSINESS HOURS
  // =============================================
  describe('getBusinessHours', () => {
    it('should return business hours', async () => {
      // Arrange
      const mockHours = [
        { day: 'monday', dayName: 'Segunda-feira', isOpen: true, start: '09:00', end: '18:00' },
      ];
      prismaMock.siteSetting.findUnique.mockResolvedValue({
        key: 'businessHours',
        value: mockHours,
      } as any);

      // Act
      const result = await settingsService.getBusinessHours();

      // Assert
      expect(result.data[0].day).toBe('monday');
      expect(result.data[0].isOpen).toBe(true);
    });

    it('should return default hours if none exist', async () => {
      // Arrange
      prismaMock.siteSetting.findUnique.mockResolvedValue(null);

      // Act
      const result = await settingsService.getBusinessHours();

      // Assert
      expect(result.data).toHaveLength(7);
      expect(result.data[0].day).toBe('monday');
    });
  });

  // =============================================
  // UPDATE BUSINESS HOURS
  // =============================================
  describe('updateBusinessHours', () => {
    it('should update business hours', async () => {
      // Arrange
      const newHours = [
        { day: 'monday', dayName: 'Segunda-feira', isOpen: false },
      ];
      prismaMock.siteSetting.upsert.mockResolvedValue({} as any);

      // Act
      const result = await settingsService.updateBusinessHours(newHours);

      // Assert
      expect(result.data[0].isOpen).toBe(false);
    });
  });

  // =============================================
  // GET CONTENT
  // =============================================
  describe('getContent', () => {
    it('should return content settings', async () => {
      // Arrange
      const mockContent = {
        key: 'content',
        value: { heroTitle: 'Bem-vindo', heroSubtitle: 'Serviços profissionais' },
      };
      prismaMock.siteSetting.findUnique.mockResolvedValue(mockContent as any);

      // Act
      const result = await settingsService.getContent();

      // Assert
      expect(result.data.heroTitle).toBe('Bem-vindo');
    });
  });

  // =============================================
  // GENERIC PROFESSIONAL DOMAIN
  // =============================================
  describe('generic professional domain', () => {
    it('should return neutral professional defaults', async () => {
      prismaMock.siteSetting.findUnique.mockResolvedValue(null);

      const result = await settingsService.getProfessional();

      expect(result.data.displayName).toBe('Profissional');
      expect(result.data.serviceMode).toBe('ONLINE');
      expect(result.data.languages).toContain('pt-BR');
    });

    it('should persist specialties', async () => {
      prismaMock.siteSetting.upsert.mockResolvedValue({} as any);
      const specialties = [{ slug: 'reiki', name: 'Reiki', isActive: true, usesCardModule: false }];

      const result = await settingsService.updateSpecialties(specialties);

      expect(result.data).toEqual(specialties);
      expect(prismaMock.siteSetting.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId_key: { tenantId: '00000000-0000-0000-0000-000000000001', key: 'specialties' } } })
      );
    });

    it('should enable tarot-cards from an active specialty', async () => {
      prismaMock.siteSetting.findUnique.mockResolvedValue({
        key: 'specialties',
        value: [
          { slug: 'tarot', name: 'Tarot', isActive: true, usesCardModule: true },
          { slug: 'reiki', name: 'Reiki', isActive: true, usesCardModule: false },
        ],
      } as any);

      const modules = await settingsService.getEnabledSpecialtyModules();

      expect(modules).toEqual(['tarot-cards']);
      await expect(settingsService.isSpecialtyModuleEnabled('tarot-cards')).resolves.toBe(true);
    });

    it('should ignore modules from inactive specialties', async () => {
      prismaMock.siteSetting.findUnique.mockResolvedValue({
        key: 'specialties',
        value: [
          { slug: 'tarot', name: 'Tarot', isActive: false, usesCardModule: true, moduleKey: 'tarot-cards' },
        ],
      } as any);

      const modules = await settingsService.getEnabledSpecialtyModules();

      expect(modules).toEqual([]);
    });

    it('should expose enabled modules in public settings', async () => {
      prismaMock.siteSetting.findUnique
        .mockResolvedValueOnce({ key: 'general', value: { siteName: 'Therapist Platform', enableShop: true } } as any)
        .mockResolvedValueOnce({ key: 'contact', value: { email: '' } } as any)
        .mockResolvedValueOnce({ key: 'businessHours', value: [] } as any)
        .mockResolvedValueOnce({ key: 'content', value: { heroTitle: 'Hello', heroSubtitle: 'World' } } as any)
        .mockResolvedValueOnce({ key: 'professional', value: { displayName: 'Profissional', languages: ['pt-BR'], credentials: [], serviceMode: 'ONLINE' } } as any)
        .mockResolvedValueOnce({ key: 'specialties', value: [{ slug: 'tarot', name: 'Tarot', isActive: true, usesCardModule: true }] } as any)
        .mockResolvedValueOnce({ key: 'seo', value: { metaTitle: 'Site', metaDescription: 'Desc', keywords: [] } } as any)
        .mockResolvedValueOnce({ key: 'branding', value: { primaryColor: '#112233' } } as any);

      const result = await settingsService.getPublic();

      expect(result.data.enabledModules).toEqual(['tarot-cards']);
    });

    it('should return neutral SEO defaults', async () => {
      prismaMock.siteSetting.findUnique.mockResolvedValue(null);

      const result = await settingsService.getSeo();

      expect(result.data.metaTitle).toBe('Therapist Platform');
      expect(result.data.metaDescription).not.toMatch(/tarot/i);
    });
  });

  // =============================================
  // GET ANALYTICS
  // =============================================
  describe('getAnalytics', () => {
    it('should return analytics settings', async () => {
      // Arrange
      const mockAnalytics = {
        key: 'analytics',
        value: { enableAnalytics: true, googleAnalyticsId: 'GA-12345' },
      };
      prismaMock.siteSetting.findUnique.mockResolvedValue(mockAnalytics as any);

      // Act
      const result = await settingsService.getAnalytics();

      // Assert
      expect(result.data.enableAnalytics).toBe(true);
    });
  });

  describe('branding', () => {
    it('should return neutral branding defaults', async () => {
      prismaMock.siteSetting.findUnique.mockResolvedValue(null);

      const result = await settingsService.getBranding();

      expect(result.data.primaryColor).toBe('#4f46e5');
      expect(result.data.fontFamily).toContain('Inter');
    });

    it('should persist branding in the requested tenant', async () => {
      prismaMock.siteSetting.findUnique.mockResolvedValue({
        key: 'branding',
        value: { primaryColor: '#112233' },
      } as any);
      prismaMock.siteSetting.upsert.mockResolvedValue({} as any);

      await settingsService.updateBranding({ primaryColor: '#abcdef' }, 'tenant-brand');

      expect(prismaMock.siteSetting.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId_key: { tenantId: 'tenant-brand', key: 'branding' } },
        })
      );
    });
  });

  // =============================================
  // GET ALL
  // =============================================
  describe('getAll', () => {
    it('should return all settings combined', async () => {
      // Arrange - Mock each getSetting call
      prismaMock.siteSetting.findUnique
        .mockResolvedValueOnce({ key: 'general', value: { siteName: 'Profissional' } } as any)
        .mockResolvedValueOnce({ key: 'contact', value: { email: 'test@test.com' } } as any)
        .mockResolvedValueOnce({ key: 'businessHours', value: [] } as any)
        .mockResolvedValueOnce({ key: 'content', value: { heroTitle: 'Hello' } } as any)
        .mockResolvedValueOnce({ key: 'professional', value: { displayName: 'Profissional' } } as any)
        .mockResolvedValueOnce({ key: 'specialties', value: [] } as any)
        .mockResolvedValueOnce({ key: 'seo', value: { metaTitle: 'Profissional' } } as any)
        .mockResolvedValueOnce({ key: 'branding', value: { primaryColor: '#112233' } } as any)
        .mockResolvedValueOnce({ key: 'analytics', value: { enableAnalytics: false } } as any);

      // Act
      const result = await settingsService.getAll();

      // Assert
      expect(result.data.general.siteName).toBe('Profissional');
      expect(result.data.contact.email).toBe('test@test.com');
      expect(result.data.content.heroTitle).toBe('Hello');
    });
  });

  // =============================================
  // GET PUBLIC
  // =============================================
  describe('getPublic', () => {
    it('should return public settings for frontend', async () => {
      // Arrange
      prismaMock.siteSetting.findUnique
        .mockResolvedValueOnce({ key: 'general', value: { siteName: 'Therapist Platform', enableShop: true } } as any)
        .mockResolvedValueOnce({ key: 'contact', value: { email: 'contato@profissional.com', instagram: '@profissional' } } as any)
        .mockResolvedValueOnce({ key: 'businessHours', value: [{ day: 'monday', dayName: 'Segunda-feira', isOpen: true, start: '09:00', end: '18:00' }] } as any)
        .mockResolvedValueOnce({ key: 'content', value: { heroTitle: 'Bem-vindo', servicesTitle: 'Serviços' } } as any)
        .mockResolvedValueOnce({ key: 'professional', value: { displayName: 'Profissional', serviceMode: 'ONLINE' } } as any)
        .mockResolvedValueOnce({ key: 'specialties', value: [{ slug: 'reiki', name: 'Reiki', isActive: true, usesCardModule: false }] } as any)
        .mockResolvedValueOnce({ key: 'seo', value: { metaTitle: 'Profissional', metaDescription: 'Atendimentos', keywords: [] } } as any)
        .mockResolvedValueOnce({ key: 'branding', value: { primaryColor: '#112233' } } as any);

      // Act
      const result = await settingsService.getPublic();

      // Assert
      expect(result.data.siteName).toBe('Therapist Platform');
      expect(result.data.enableShop).toBe(true);
      expect(result.data.contact.email).toBe('contato@profissional.com');
      expect(result.data.businessHours).toHaveLength(1);
      expect(result.data.content.servicesTitle).toBe('Serviços');
      expect(result.data.heroTitle).toBe('Bem-vindo');
    });
  });
 
  describe('tenant isolation', () => {
    it('should read the same setting key independently for two tenants', async () => {
      prismaMock.siteSetting.findUnique
        .mockResolvedValueOnce({
          id: 'setting-a',
          tenantId: 'tenant-a',
          key: 'general',
          value: {
            siteName: 'Clínica A',
            enableShop: true,
          },
        } as any)
        .mockResolvedValueOnce({
          id: 'setting-b',
          tenantId: 'tenant-b',
          key: 'general',
          value: {
            siteName: 'Clínica B',
            enableShop: true,
          },
        } as any);

      const tenantA = await settingsService.getGeneral('tenant-a');
      const tenantB = await settingsService.getGeneral('tenant-b');

      expect(tenantA.data.siteName).toBe('Clínica A');
      expect(tenantB.data.siteName).toBe('Clínica B');
      expect(prismaMock.siteSetting.findUnique).toHaveBeenNthCalledWith(1, {
        where: {
          tenantId_key: { tenantId: 'tenant-a', key: 'general' },
        },
      });
      expect(prismaMock.siteSetting.findUnique).toHaveBeenNthCalledWith(2, {
        where: {
          tenantId_key: { tenantId: 'tenant-b', key: 'general' },
        },
      });
    });

    it('should upsert a setting inside the requested tenant only', async () => {
      prismaMock.siteSetting.findUnique.mockResolvedValue({
        tenantId: 'tenant-b',
        key: 'general',
        value: {
          siteName: 'Clínica B',
          enableShop: true,
        },
      } as any);
      prismaMock.siteSetting.upsert.mockResolvedValue({} as any);

      await settingsService.updateGeneral({ siteName: 'Clínica B Nova' }, 'tenant-b');

      expect(prismaMock.siteSetting.upsert).toHaveBeenCalledWith({
        where: {
          tenantId_key: { tenantId: 'tenant-b', key: 'general' },
        },
        update: {
          value: expect.objectContaining({ siteName: 'Clínica B Nova' }),
        },
        create: {
          tenantId: 'tenant-b',
          key: 'general',
          value: expect.objectContaining({ siteName: 'Clínica B Nova' }),
        },
      });
    });
  });
});
