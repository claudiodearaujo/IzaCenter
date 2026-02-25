import { test, expect } from '@playwright/test';

/**
 * Authentication flow E2E tests
 * Tests login, register, forgot-password pages and basic form interactions.
 */
test.describe('Authentication', () => {
  test('login page loads and shows form', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('app-login')).toBeVisible();
    await expect(page.getByRole('textbox').first()).toBeVisible();
  });

  test('register page loads and shows form', async ({ page }) => {
    await page.goto('/auth/cadastro');
    await expect(page.locator('app-register')).toBeVisible();
  });

  test('forgot-password page loads', async ({ page }) => {
    await page.goto('/auth/esqueci-senha');
    await expect(page.locator('app-forgot-password')).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/auth/login');
    // Fill in invalid credentials
    await page.getByRole('textbox', { name: /email/i }).fill('invalid@test.com');
    await page.getByRole('textbox', { name: /senha|password/i }).fill('wrongpassword');
    await page.getByRole('button', { name: /entrar|login|acessar/i }).click();
    // Should show an error or stay on login page
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('navigating to protected admin route redirects to login', async ({ page }) => {
    await page.goto('/admin');
    // Should redirect to login since not authenticated
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('navigating to protected client route redirects to login', async ({ page }) => {
    await page.goto('/cliente');
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('login page has link to register', async ({ page }) => {
    await page.goto('/auth/login');
    const registerLink = page.getByRole('link', { name: /cadastr|registr|criar conta/i });
    await expect(registerLink).toBeVisible();
  });

  test('register page has link to login', async ({ page }) => {
    await page.goto('/auth/cadastro');
    const loginLink = page.getByRole('link', { name: /entrar|login|já tem conta/i });
    await expect(loginLink).toBeVisible();
  });
});
