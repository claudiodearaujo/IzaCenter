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
});
