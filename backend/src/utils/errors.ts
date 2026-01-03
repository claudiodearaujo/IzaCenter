// apps/backend/src/utils/errors.ts

export class NotFoundException extends Error {
  constructor(message: string = 'Recurso não encontrado') {
    super(message);
    this.name = 'NotFoundException';
  }
}

export class BadRequestException extends Error {
  constructor(message: string = 'Requisição inválida') {
    super(message);
    this.name = 'BadRequestException';
  }
}

export class UnauthorizedException extends Error {
  constructor(message: string = 'Não autorizado') {
    super(message);
    this.name = 'UnauthorizedException';
  }
}

export class ForbiddenException extends Error {
  constructor(message: string = 'Acesso negado') {
    super(message);
    this.name = 'ForbiddenException';
  }
}
