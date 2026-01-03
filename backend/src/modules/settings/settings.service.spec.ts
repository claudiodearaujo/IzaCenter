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
        value: { siteName: 'Izabela Tarot', enableShop: true },
      };
      prismaMock.siteSetting.findUnique.mockResolvedValue(mockSetting as any);

      // Act
      const result = await settingsService.getGeneral();

      // Assert
      expect(result.data.siteName).toBe('Izabela Tarot');
    });

    it('should return defaults if no settings exist', async () => {
      // Arrange
      prismaMock.siteSetting.findUnique.mockResolvedValue(null);

      // Act
      const result = await settingsService.getGeneral();

      // Assert
      expect(result.data.siteName).toBe('Izabela Tarot');
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
        value: { email: 'contato@izabela.com', phone: '11999999999' },
      };
      prismaMock.siteSetting.findUnique.mockResolvedValue(mockSetting as any);

      // Act
      const result = await settingsService.getContact();

      // Assert
      expect(result.data.email).toBe('contato@izabela.com');
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
        value: { heroTitle: 'Bem-vindo', heroSubtitle: 'Tarot Online' },
      };
      prismaMock.siteSetting.findUnique.mockResolvedValue(mockContent as any);

      // Act
      const result = await settingsService.getContent();

      // Assert
      expect(result.data.heroTitle).toBe('Bem-vindo');
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

  // =============================================
  // GET ALL
  // =============================================
  describe('getAll', () => {
    it('should return all settings combined', async () => {
      // Arrange - Mock each getSetting call
      prismaMock.siteSetting.findUnique
        .mockResolvedValueOnce({ key: 'general', value: { siteName: 'Izabela' } } as any)
        .mockResolvedValueOnce({ key: 'contact', value: { email: 'test@test.com' } } as any)
        .mockResolvedValueOnce({ key: 'businessHours', value: [] } as any)
        .mockResolvedValueOnce({ key: 'content', value: { heroTitle: 'Hello' } } as any)
        .mockResolvedValueOnce({ key: 'analytics', value: { enableAnalytics: false } } as any);

      // Act
      const result = await settingsService.getAll();

      // Assert
      expect(result.data.general.siteName).toBe('Izabela');
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
        .mockResolvedValueOnce({ key: 'general', value: { siteName: 'Izabela Tarot', enableShop: true } } as any)
        .mockResolvedValueOnce({ key: 'contact', value: { email: 'contato@izabela.com', instagram: '@izabela' } } as any)
        .mockResolvedValueOnce({ key: 'content', value: { heroTitle: 'Bem-vindo' } } as any);

      // Act
      const result = await settingsService.getPublic();

      // Assert
      expect(result.data.siteName).toBe('Izabela Tarot');
      expect(result.data.enableShop).toBe(true);
      expect(result.data.contact.email).toBe('contato@izabela.com');
      expect(result.data.heroTitle).toBe('Bem-vindo');
    });
  });
});
