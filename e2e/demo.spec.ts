import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  // Navigates to process.env.BASE_URL or http://localhost:3000
  await page.goto('/');

  // Check that the page has loaded by checking body visibility
  await expect(page.locator('body')).toBeVisible();

  // Log page title to console
  const title = await page.title();
  console.log(`Page title is: ${title}`);
});