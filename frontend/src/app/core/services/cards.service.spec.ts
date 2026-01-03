import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CardsService, CiganoCard } from './cards.service';
import { environment } from '../../../environments/environment';

describe('CardsService', () => {
  let service: CardsService;
  let httpMock: HttpTestingController;

  const mockCard: CiganoCard = {
    id: 'card-1',
    number: 31,
    name: 'O Sol',
    isPositive: true,
    generalMeaning: 'Sucesso, energia, vitalidade',
    loveMeaning: 'Relacionamento próspero',
    imageUrl: '/assets/cards/31.jpg',
  };

  const mockCards: CiganoCard[] = [
    mockCard,
    { id: 'card-2', number: 32, name: 'A Lua', isPositive: true },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CardsService],
    });

    service = TestBed.inject(CardsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('findAll', () => {
    it('should return all cards', () => {
      service.findAll().subscribe((response) => {
        expect(response.data.length).toBe(2);
        expect(response.data[0].name).toBe('O Sol');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockCards });
    });
  });

  describe('findById', () => {
    it('should return card by id', () => {
      service.findById('card-1').subscribe((response) => {
        expect(response.data.id).toBe('card-1');
        expect(response.data.name).toBe('O Sol');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards/card-1`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockCard });
    });
  });

  describe('findByNumber', () => {
    it('should return card by number', () => {
      service.findByNumber(31).subscribe((response) => {
        expect(response.data.number).toBe(31);
        expect(response.data.name).toBe('O Sol');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards/number/31`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockCard });
    });
  });

  describe('admin create', () => {
    it('should create a new card', () => {
      const createData = {
        number: 37,
        name: 'Nova Carta',
        isPositive: true,
        generalMeaning: 'Significado teste',
      };

      service.create(createData).subscribe((response) => {
        expect(response.data.name).toBe('Nova Carta');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/cards`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createData);
      req.flush({ data: { id: 'new-card', ...createData } });
    });
  });

  describe('admin update', () => {
    it('should update a card', () => {
      const updateData = { generalMeaning: 'Novo significado' };

      service.update('card-1', updateData).subscribe((response) => {
        expect(response.data.generalMeaning).toBe('Novo significado');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/cards/card-1`);
      expect(req.request.method).toBe('PUT');
      req.flush({ data: { ...mockCard, ...updateData } });
    });
  });

  describe('admin delete', () => {
    it('should delete a card', () => {
      service.delete('card-1').subscribe((response) => {
        expect(response.message).toContain('excluída');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/cards/card-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Carta excluída com sucesso' });
    });
  });

  describe('admin generateDeck', () => {
    it('should generate the complete deck', () => {
      service.generateDeck().subscribe((response) => {
        expect(response.count).toBe(36);
        expect(response.message).toContain('36 cartas');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/cards/generate-deck`);
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Baralho gerado com 36 cartas', count: 36 });
    });
  });
});
