// Force Decimal to accept any type
declare class Decimal {
  constructor(value: any);
  mul(n: any): Decimal;
  div(n: any): Decimal;
  add(n: any): Decimal;
  sub(n: any): Decimal;
  gte(n: any): boolean;
  lte(n: any): boolean;
  toNumber(): number;
  toString(): string;
  toFixed(places?: number): string;
  toJSON(): any;
}

declare namespace Prisma {
  export { Decimal };
}

export { Decimal };
