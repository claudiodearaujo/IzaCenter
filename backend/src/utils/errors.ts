import { AppError } from '../middlewares/error.middleware';
// apps/backend/src/utils/errors.ts

export class NotFoundException extends AppError {
  constructor(message: string = 'Recurso não encontrado') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundException';
  }
}

export class BadRequestException extends AppError {
  constructor(message: string = 'Requisição inválida') {
    super(message, 400, 'BAD_REQUEST');
    this.name = 'BadRequestException';
  }
}

export class UnauthorizedException extends AppError {
  constructor(message: string = 'Não autorizado') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedException';
  }
}

export class ForbiddenException extends AppError {
  constructor(message: string = 'Acesso negado') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenException';
  }
}
