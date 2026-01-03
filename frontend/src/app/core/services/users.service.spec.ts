import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UsersService, User, UpdateUserDTO } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: '1',
    email: 'maria@example.com',
    fullName: 'Maria Silva',
    role: 'CLIENT',
    isActive: true,
    preferredLanguage: 'pt-BR',
    notificationEmail: true,
    notificationWhatsapp: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UsersService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      const mockResponse = { data: mockUser, success: true };

      service.getProfile().subscribe(response => {
        expect(response.data).toEqual(mockUser);
      });

      const req = httpMock.expectOne('/api/users/profile');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', () => {
      const updateData: UpdateUserDTO = { fullName: 'Maria Silva Santos' };
      const mockResponse = { data: { ...mockUser, ...updateData }, success: true };

      service.updateProfile(updateData).subscribe(response => {
        expect(response.data.fullName).toBe('Maria Silva Santos');
      });

      const req = httpMock.expectOne('/api/users/profile');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
    });
  });

  describe('changePassword', () => {
    it('should change password', () => {
      const mockResponse = { message: 'Senha alterada com sucesso' };

      service.changePassword('senhaAtual', 'novaSenha').subscribe(response => {
        expect(response.message).toBe('Senha alterada com sucesso');
      });

      const req = httpMock.expectOne('/api/users/change-password');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        currentPassword: 'senhaAtual',
        newPassword: 'novaSenha',
      });
      req.flush(mockResponse);
    });
  });

  describe('findAll (admin)', () => {
    it('should return all users', () => {
      const mockResponse = { data: [mockUser], total: 1, page: 1, limit: 10 };

      service.findAll().subscribe(response => {
        expect(response.data).toEqual([mockUser]);
      });

      const req = httpMock.expectOne('/api/admin/users');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return users with filters', () => {
      const mockResponse = { data: [mockUser], total: 1, page: 1, limit: 10 };

      service.findAll({ role: 'CLIENT', search: 'maria' }).subscribe(response => {
        expect(response.data).toEqual([mockUser]);
      });

      const req = httpMock.expectOne(req =>
        req.url === '/api/admin/users' &&
        req.params.get('role') === 'CLIENT' &&
        req.params.get('search') === 'maria'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('findById (admin)', () => {
    it('should return user by id', () => {
      const mockResponse = { data: mockUser, success: true };

      service.findById('1').subscribe(response => {
        expect(response.data).toEqual(mockUser);
      });

      const req = httpMock.expectOne('/api/admin/users/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('update (admin)', () => {
    it('should update user', () => {
      const updateData: UpdateUserDTO = { notes: 'Cliente VIP' };
      const mockResponse = { data: { ...mockUser, ...updateData }, success: true };

      service.update('1', updateData).subscribe(response => {
        expect(response.data.notes).toBe('Cliente VIP');
      });

      const req = httpMock.expectOne('/api/admin/users/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
    });
  });
});
