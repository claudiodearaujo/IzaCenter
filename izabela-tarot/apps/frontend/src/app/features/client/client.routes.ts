// apps/frontend/src/app/features/client/client.routes.ts

import { Routes } from '@angular/router';

export const CLIENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'pedidos',
    loadComponent: () =>
      import('./orders/order-list/order-list.component').then(
        (m) => m.OrderListComponent
      ),
  },
  {
    path: 'pedidos/:id',
    loadComponent: () =>
      import('./orders/order-detail/order-detail.component').then(
        (m) => m.OrderDetailComponent
      ),
  },
  {
    path: 'leituras',
    loadComponent: () =>
      import('./readings/reading-list/reading-list.component').then(
        (m) => m.ReadingListComponent
      ),
  },
  {
    path: 'leituras/:id',
    loadComponent: () =>
      import('./readings/reading-detail/reading-detail.component').then(
        (m) => m.ReadingDetailComponent
      ),
  },
  {
    path: 'agendamentos',
    loadComponent: () =>
      import('./appointments/appointment-list/appointment-list.component').then(
        (m) => m.AppointmentListComponent
      ),
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./profile/profile.component').then((m) => m.ProfileComponent),
  },
];
