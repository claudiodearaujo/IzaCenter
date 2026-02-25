import { test, expect } from '@playwright/test';

/**
 * Shop E2E tests
 * Verifies that the shop (product listing), product details, and cart work correctly.
 */
test.describe('Shop', () => {
  test('shop page loads and shows product listing', async ({ page }) => {
    await page.goto('/loja');
    await expect(page.locator('app-product-list')).toBeVisible();
  });

  test('cart page loads', async ({ page }) => {
    await page.goto('/carrinho');
    await expect(page.locator('app-cart')).toBeVisible();
  });

  test('shop page has search or filter controls', async ({ page }) => {
    await page.goto('/loja');
    // Wait for page to fully render
    await page.waitForLoadState('networkidle');
    // Should have some input or filter controls
    const inputs = page.getByRole('textbox');
    const buttons = page.getByRole('button');
    const hasControls = (await inputs.count()) > 0 || (await buttons.count()) > 0;
    expect(hasControls).toBeTruthy();
  });

  test('checkout requires authentication', async ({ page }) => {
    await page.goto('/checkout');
    // Should redirect to login since not authenticated
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('navigating to a non-existent product slug shows 404', async ({ page }) => {
    await page.goto('/loja/produto-que-nao-existe-xyzabc');
    // Either shows 404 component or redirects
    const is404 = await page.locator('app-not-found').isVisible().catch(() => false);
    const hasError = await page.locator('[class*="error"], [class*="not-found"]').isVisible().catch(() => false);
    expect(is404 || hasError).toBeTruthy();
  });
});
