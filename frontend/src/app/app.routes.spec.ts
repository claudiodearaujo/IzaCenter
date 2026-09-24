import { routes } from './app.routes';

describe('public root route', () => {
  it('should keep / mapped to the public Home without an auth guard', () => {
    const publicRoot = routes.find((route) => route.path === '');

    expect(publicRoot).toBeDefined();
    expect(publicRoot?.canActivate).toBeUndefined();
    expect(publicRoot?.children).toBeDefined();

    const home = publicRoot?.children?.find((route) => route.path === '');
    expect(home).toBeDefined();
    expect(home?.canActivate).toBeUndefined();
    expect(home?.loadComponent).toBeDefined();
  });

  it('should keep the auth area on /auth instead of the root route', () => {
    const authRoute = routes.find((route) => route.path === 'auth');

    expect(authRoute).toBeDefined();
    expect(authRoute?.path).toBe('auth');
  });

  it('should expose professional onboarding without an auth guard', () => {
    const onboarding = routes.find((route) => route.path === 'onboarding/profissional');

    expect(onboarding).toBeDefined();
    expect(onboarding?.canActivate).toBeUndefined();
    expect(onboarding?.loadComponent).toBeDefined();
  });

  it('should expose billing inside the admin route protected by the admin guard', () => {
    const admin = routes.find((route) => route.path === 'admin');
    const billing = admin?.children?.find((route) => route.path === 'assinatura');

    expect(admin).toBeDefined();
    expect(admin?.canActivate).toBeDefined();
    expect(billing).toBeDefined();
    expect(billing?.loadComponent).toBeDefined();
  });

  it('should expose client privacy inside the client route protected by the client guard', () => {
    const client = routes.find((route) => route.path === 'cliente');
    const privacy = client?.children?.find((route) => route.path === 'privacidade');

    expect(client).toBeDefined();
    expect(client?.canActivate).toBeDefined();
    expect(privacy).toBeDefined();
    expect(privacy?.loadComponent).toBeDefined();
  });

  it('should expose admin privacy inside the admin route protected by the admin guard', () => {
    const admin = routes.find((route) => route.path === 'admin');
    const privacy = admin?.children?.find((route) => route.path === 'privacidade');

    expect(admin).toBeDefined();
    expect(admin?.canActivate).toBeDefined();
    expect(privacy).toBeDefined();
    expect(privacy?.loadComponent).toBeDefined();
  });
});
