import { test, expect } from '@playwright/test';

test('Admin bulk actions dialog opens and shows actions', async ({ page }) => {
  // Navigate to admin dashboard
  await page.goto('/admin');

  // Click Products tab
  await page.click('text=Products');

  // Wait for products area to load
  await page.waitForSelector('text=All Products');

  // If there are products, open bulk actions on small screens; otherwise just open the bulk actions dialog via button
  const bulkBtn = page.locator('button:has-text("Bulk actions")');
  await expect(bulkBtn).toBeVisible();
  await bulkBtn.click();

  // Ensure bulk actions dialog is visible
  await expect(page.locator('text=Bulk actions')).toBeVisible();

  // Check that key actions exist
  await expect(page.locator('button:has-text("Delete")')).toBeVisible();
  await expect(page.locator('button:has-text("Move Category")')).toBeVisible();
  await expect(page.locator('button:has-text("Adjust Price %")')).toBeVisible();
});
