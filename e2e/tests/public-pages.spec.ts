import { test, expect } from '@playwright/test';

/**
 * Public pages smoke tests
 * Verifies that all public routes load correctly and display expected content.
 */
test.describe('Public Pages', () => {
  test('home page loads and displays hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Izabela Tarot|IzaCenter/i);
    // Check hero section is visible
    await expect(page.locator('app-home')).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/sobre');
    await expect(page.locator('app-about')).toBeVisible();
  });

  test('services page loads', async ({ page }) => {
    await page.goto('/servicos');
    await expect(page.locator('app-services')).toBeVisible();
  });

  test('contact page loads', async ({ page }) => {
    await page.goto('/contato');
    await expect(page.locator('app-contact')).toBeVisible();
  });

  test('faq page loads', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.locator('app-faq')).toBeVisible();
  });

  test('testimonials page loads', async ({ page }) => {
    await page.goto('/depoimentos');
    await expect(page.locator('app-testimonials')).toBeVisible();
  });

  test('terms of service page loads', async ({ page }) => {
    await page.goto('/termos-de-uso');
    await expect(page.locator('app-terms')).toBeVisible();
  });

  test('privacy policy page loads', async ({ page }) => {
    await page.goto('/politica-de-privacidade');
    await expect(page.locator('app-privacy')).toBeVisible();
  });

  test('404 page shows for unknown routes', async ({ page }) => {
    await page.goto('/rota-que-nao-existe');
    await expect(page.locator('app-not-found')).toBeVisible();
  });

  test('header navigation renders', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('app-header');
    await expect(header).toBeVisible();
  });

  test('footer renders', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('app-footer');
    await expect(footer).toBeVisible();
  });
});
