import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    // Create spy for localStorage
    const store: { [key: string]: string } = {};
    localStorageSpy = jasmine.createSpyObj('localStorage', ['getItem', 'setItem', 'removeItem', 'clear']);
    
    localStorageSpy.getItem.and.callFake((key: string) => store[key] || null);
    localStorageSpy.setItem.and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    localStorageSpy.removeItem.and.callFake((key: string) => {
      delete store[key];
    });

    // Replace window.localStorage
    spyOnProperty(window, 'localStorage', 'get').and.returnValue(localStorageSpy);

    TestBed.configureTestingModule({
      providers: [StorageService],
    });

    service = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('set', () => {
    it('should store string value', () => {
      service.set('testKey', 'testValue');
      expect(localStorageSpy.setItem).toHaveBeenCalledWith('testKey', '"testValue"');
    });

    it('should store object as JSON', () => {
      const obj = { name: 'Test', value: 123 };
      service.set('objKey', obj);
      expect(localStorageSpy.setItem).toHaveBeenCalledWith('objKey', JSON.stringify(obj));
    });

    it('should store array as JSON', () => {
      const arr = [1, 2, 3];
      service.set('arrKey', arr);
      expect(localStorageSpy.setItem).toHaveBeenCalledWith('arrKey', JSON.stringify(arr));
    });
  });

  describe('get', () => {
    it('should retrieve and parse stored value', () => {
      localStorageSpy.getItem.and.returnValue('"storedValue"');
      const result = service.get<string>('testKey');
      expect(result).toBe('storedValue');
    });

    it('should retrieve and parse stored object', () => {
      const obj = { name: 'Test', value: 123 };
      localStorageSpy.getItem.and.returnValue(JSON.stringify(obj));
      const result = service.get<typeof obj>('objKey');
      expect(result).toEqual(obj);
    });

    it('should return null for non-existent key', () => {
      localStorageSpy.getItem.and.returnValue(null);
      const result = service.get('nonExistent');
      expect(result).toBeNull();
    });

    it('should handle invalid JSON gracefully', () => {
      localStorageSpy.getItem.and.returnValue('invalid json {');
      const result = service.get('badKey');
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove item from storage', () => {
      service.remove('testKey');
      expect(localStorageSpy.removeItem).toHaveBeenCalledWith('testKey');
    });
  });

  describe('clear', () => {
    it('should clear all storage', () => {
      service.clear();
      expect(localStorageSpy.clear).toHaveBeenCalled();
    });
  });

  describe('has', () => {
    it('should return true if key exists', () => {
      localStorageSpy.getItem.and.returnValue('"value"');
      expect(service.has('existingKey')).toBeTrue();
    });

    it('should return false if key does not exist', () => {
      localStorageSpy.getItem.and.returnValue(null);
      expect(service.has('nonExistent')).toBeFalse();
    });
  });
});
