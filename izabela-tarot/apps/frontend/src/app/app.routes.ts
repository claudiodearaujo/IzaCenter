import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { clientGuard } from './core/guards/client.guard';

export const routes: Routes = [
  // Public Routes
  {
    path: '',
    loadComponent: () => import('./layouts/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'sobre',
        loadComponent: () => import('./features/public/about/about.component').then(m => m.AboutComponent)
      },
      {
        path: 'servicos',
        loadComponent: () => import('./features/public/services/services.component').then(m => m.ServicesComponent)
      },
      {
        path: 'contato',
        loadComponent: () => import('./features/public/contact/contact.component').then(m => m.ContactComponent)
      },
      {
        path: 'depoimentos',
        loadComponent: () => import('./features/public/testimonials/testimonials.component').then(m => m.TestimonialsComponent)
      },
      {
        path: 'faq',
        loadComponent: () => import('./features/public/faq/faq.component').then(m => m.FaqComponent)
      },
      {
        path: 'loja',
        loadComponent: () => import('./features/shop/product-list/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'loja/:slug',
        loadComponent: () => import('./features/shop/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
      },
      {
        path: 'carrinho',
        loadComponent: () => import('./features/shop/cart/cart.component').then(m => m.CartComponent)
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/shop/checkout/checkout.component').then(m => m.CheckoutComponent),
        canActivate: [authGuard]
      }
    ]
  },

  // Auth Routes
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'cadastro',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'esqueci-senha',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'redefinir-senha',
        loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
      }
    ]
  },

  // Client Routes
  {
    path: 'cliente',
    loadComponent: () => import('./layouts/client-layout/client-layout.component').then(m => m.ClientLayoutComponent),
    canActivate: [clientGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/client/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'leituras',
        loadComponent: () => import('./features/client/readings/reading-list/reading-list.component').then(m => m.ReadingListComponent)
      },
      {
        path: 'leituras/:id',
        loadComponent: () => import('./features/client/readings/reading-detail/reading-detail.component').then(m => m.ReadingDetailComponent)
      },
      {
        path: 'agendamentos',
        loadComponent: () => import('./features/client/appointments/my-appointments/my-appointments.component').then(m => m.MyAppointmentsComponent)
      },
      {
        path: 'agendar',
        loadComponent: () => import('./features/client/appointments/schedule/schedule.component').then(m => m.ScheduleComponent)
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./features/client/payment-history/payment-history.component').then(m => m.PaymentHistoryComponent)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/client/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },

  // Admin Routes
  {
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'leituras',
        loadComponent: () => import('./features/admin/readings/pending-readings/pending-readings.component').then(m => m.PendingReadingsComponent)
      },
      {
        path: 'leituras/:id',
        loadComponent: () => import('./features/admin/readings/reading-editor/reading-editor.component').then(m => m.ReadingEditorComponent)
      },
      {
        path: 'agendamentos',
        loadComponent: () => import('./features/admin/schedule/appointments/appointments.component').then(m => m.AppointmentsComponent)
      },
      {
        path: 'disponibilidade',
        loadComponent: () => import('./features/admin/schedule/availability/availability.component').then(m => m.AvailabilityComponent)
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./features/admin/orders/order-list/order-list.component').then(m => m.OrderListComponent)
      },
      {
        path: 'pedidos/:id',
        loadComponent: () => import('./features/admin/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent)
      },
      {
        path: 'produtos',
        loadComponent: () => import('./features/admin/products/product-list/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'produtos/novo',
        loadComponent: () => import('./features/admin/products/product-form/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'produtos/:id',
        loadComponent: () => import('./features/admin/products/product-form/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'clientes',
        loadComponent: () => import('./features/admin/clients/clients.component').then(m => m.ClientsComponent)
      },
      {
        path: 'relatorios',
        loadComponent: () => import('./features/admin/reports/reports.component').then(m => m.ReportsComponent)
      }
    ]
  },

  // Fallback
  {
    path: '**',
    redirectTo: ''
  }
];
