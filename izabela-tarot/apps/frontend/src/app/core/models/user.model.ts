export type UserRole = 'CLIENT' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  birthDate?: string;
  avatarUrl?: string;
  role: UserRole;
  preferredLanguage: string;
  notificationEmail: boolean;
  notificationWhatsapp: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}
