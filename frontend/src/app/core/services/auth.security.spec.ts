import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';

describe('Auth security contract', () => {
  let api: jasmine.SpyObj<ApiService>;
  let storage: jasmine.SpyObj<StorageService>;
  let service: AuthService;
  const data = { user: { id: 'synthetic' }, membership: { role: 'OWNER' }, accessToken: 'access' } as any;
  beforeEach(() => {
    api = jasmine.createSpyObj('ApiService', ['post', 'get']);
    storage = jasmine.createSpyObj('StorageService', ['get', 'set', 'remove']);
    TestBed.configureTestingModule({ providers: [AuthService,
      { provide: ApiService, useValue: api }, { provide: StorageService, useValue: storage },
      { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
    ] });
    service = TestBed.inject(AuthService);
  });
  it('keeps bearer only in memory and removes legacy stored credentials', () => {
    service.establishSession(data);
    expect(service.getAccessToken()).toBe('access');
    expect(storage.set).not.toHaveBeenCalled();
    expect(storage.remove).toHaveBeenCalledWith('accessToken');
  });
  it('refreshes the profile without persisting personal data', () => {
    api.get.and.returnValue(of({ data: data.user }));
    service.refreshProfile();
    expect(service.currentUser()).toEqual(data.user);
    expect(storage.set).not.toHaveBeenCalled();
  });
  it('uses canonical refresh endpoint and coalesces concurrent refreshes', async () => {
    api.post.and.returnValue(of({ success: true, data }));
    const first = firstValueFrom(service.refreshToken());
    const second = firstValueFrom(service.refreshToken());
    await Promise.all([first, second]);
    expect(api.post).toHaveBeenCalledOnceWith('/auth/refresh', {});
    expect(service.isAdmin()).toBeTrue();
  });
});
