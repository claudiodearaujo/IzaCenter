import { prisma } from '../../config/database';
import { Errors } from '../../middlewares/error.middleware';
import { generateTokenPair, hashPassword } from '../../utils';
import { ProfessionalOnboardingDto } from './onboarding.schema';

const RESERVED_SLUGS = new Set([
  'www', 'api', 'admin', 'auth', 'app', 'default', 'support', 'help', 'billing',
]);

export class OnboardingService {
  isSlugReserved(slug: string): boolean {
    return RESERVED_SLUGS.has(slug.toLowerCase());
  }

  async onboardProfessional(data: ProfessionalOnboardingDto) {
    if (this.isSlugReserved(data.tenantSlug)) {
      throw Errors.BadRequest('Este identificador de workspace é reservado');
    }

    const passwordHash = await hashPassword(data.password);

    const result = await prisma.$transaction(async (tx) => {
      const [existingTenant, existingUser] = await Promise.all([
        tx.tenant.findUnique({ where: { slug: data.tenantSlug } }),
        tx.user.findUnique({ where: { email: data.email } }),
      ]);

      if (existingTenant) {
        throw Errors.Conflict('Este identificador de workspace já está em uso');
      }

      if (existingUser) {
        throw Errors.Conflict('Este email já está cadastrado');
      }

      const tenant = await tx.tenant.create({
        data: {
          name: data.tenantName,
          slug: data.tenantSlug,
          status: 'ACTIVE',
          planKey: 'starter',
          onboardingCompletedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          planKey: true,
          customDomain: true,
          onboardingCompletedAt: true,
        },
      });

      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          fullName: data.fullName,
          phone: data.phone,
          role: 'CLIENT',
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          birthDate: true,
          role: true,
          avatarUrl: true,
          preferredLanguage: true,
          notificationEmail: true,
          notificationWhatsapp: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      });

      const membership = await tx.tenantMembership.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          role: 'OWNER',
          isActive: true,
        },
        select: {
          id: true,
          role: true,
          isActive: true,
        },
      });

      await tx.saasSubscription.create({
        data: {
          tenantId: tenant.id,
          planKey: 'starter',
          status: 'FREE',
          provider: 'stripe',
        },
      });

      await tx.siteSetting.createMany({
        data: this.buildInitialSettings(tenant.id, data),
      });

      return { tenant, user, membership };
    });

    const tokens = generateTokenPair({
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    return {
      ...result,
      ...tokens,
    };
  }

  private buildInitialSettings(tenantId: string, data: ProfessionalOnboardingDto) {
    const description = `Atendimentos e serviços de ${data.fullName}`;

    return [
      {
        tenantId,
        key: 'general',
        value: {
          siteName: data.tenantName,
          siteDescription: description,
          enableShop: true,
          enableAppointments: true,
          enableTestimonials: true,
        },
      },
      {
        tenantId,
        key: 'contact',
        value: {
          email: data.contactEmail || data.email,
          phone: data.phone || '',
          whatsapp: data.phone || '',
        },
      },
      {
        tenantId,
        key: 'professional',
        value: {
          displayName: data.fullName,
          professionalTitle: data.professionalTitle,
          bio: '',
          photoUrl: '',
          languages: ['pt-BR'],
          serviceMode: data.serviceMode,
          location: '',
          credentials: [],
        },
      },
      {
        tenantId,
        key: 'specialties',
        value: [],
      },
      {
        tenantId,
        key: 'seo',
        value: {
          metaTitle: data.tenantName,
          metaDescription: description,
          keywords: ['atendimento', 'serviços', 'profissional'],
        },
      },
      {
        tenantId,
        key: 'content',
        value: {
          heroTitle: `Atendimento com ${data.fullName}`,
          heroSubtitle: 'Conheça os serviços disponíveis e escolha a melhor forma de atendimento para você.',
          heroPrimaryCtaLabel: 'Conhecer serviços',
          heroPrimaryCtaUrl: '/servicos',
          heroSecondaryCtaLabel: 'Conhecer o profissional',
          heroSecondaryCtaUrl: '/sobre',
          aboutTitle: 'Conheça o profissional',
          servicesTitle: 'Serviços',
          ctaTitle: 'Pronto para começar?',
          ctaButtonLabel: 'Ver serviços',
          ctaButtonUrl: '/servicos',
        },
      },
      {
        tenantId,
        key: 'branding',
        value: {
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          accentColor: data.accentColor,
          surfaceColor: '#ffffff',
          textColor: '#111827',
          logoUrl: '',
          faviconUrl: '',
          fontFamily: 'Inter, sans-serif',
          borderRadius: '12px',
        },
      },
    ];
  }
}

export const onboardingService = new OnboardingService();
