// apps/frontend/src/app/features/admin/admin.routes.ts

import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
  },
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./users/user-list/user-list.component').then(
        (m) => m.UserListComponent
      ),
  },
  {
    path: 'usuarios/:id',
    loadComponent: () =>
      import('./users/user-detail/user-detail.component').then(
        (m) => m.UserDetailComponent
      ),
  },
  {
    path: 'produtos',
    loadComponent: () =>
      import('./products/product-list/product-list.component').then(
        (m) => m.AdminProductListComponent
      ),
  },
  {
    path: 'produtos/novo',
    loadComponent: () =>
      import('./products/product-form/product-form.component').then(
        (m) => m.ProductFormComponent
      ),
  },
  {
    path: 'produtos/:id',
    loadComponent: () =>
      import('./products/product-form/product-form.component').then(
        (m) => m.ProductFormComponent
      ),
  },
  {
    path: 'categorias',
    loadComponent: () =>
      import('./categories/category-list/category-list.component').then(
        (m) => m.CategoryListComponent
      ),
  },
  {
    path: 'leituras',
    loadComponent: () =>
      import('./readings/reading-list/reading-list.component').then(
        (m) => m.AdminReadingListComponent
      ),
  },
  {
    path: 'leituras/:id',
    loadComponent: () =>
      import('./readings/reading-form/reading-form.component').then(
        (m) => m.ReadingFormComponent
      ),
  },
  {
    path: 'cartas',
    loadComponent: () =>
      import('./cards/card-list/card-list.component').then(
        (m) => m.CardListComponent
      ),
  },
  {
    path: 'agendamentos',
    loadComponent: () =>
      import('./appointments/appointment-list/appointment-list.component').then(
        (m) => m.AdminAppointmentListComponent
      ),
  },
  {
    path: 'depoimentos',
    loadComponent: () =>
      import('./testimonials/testimonial-list/testimonial-list.component').then(
        (m) => m.TestimonialListComponent
      ),
  },
  {
    path: 'configuracoes',
    loadComponent: () =>
      import('./settings/settings.component').then((m) => m.SettingsComponent),
  },
];
