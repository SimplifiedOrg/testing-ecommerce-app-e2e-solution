import { test, expect } from '@playwright/test';

test.describe('Browsing and adding to cart', () => {
  test('loads the product listing and adds an item to the cart', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

    // Products load after a simulated delay
    // Playwright's locators auto-retry until the button actually appears, so need for manual wait
    const addButton = page.getByRole('button', { name: 'Add Wireless Headphones to cart' });
    await addButton.click();

    await expect(page.getByRole('link', { name: 'Cart (1)' })).toBeVisible();
  });

  test('increases the cart count when the same product is added twice', async ({ page }) => {
    await page.goto('/');

    const addButton = page.getByRole('button', { name: 'Add Ceramic Mug to cart' });
    await addButton.click();
    await addButton.click();

    await expect(page.getByRole('link', { name: 'Cart (2)' })).toBeVisible();
  });

  test('tracks two different products added to the cart', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Add Ceramic Mug to cart' }).click();
    await page.getByRole('button', { name: 'Add Desk Lamp to cart' }).click();

    await expect(page.getByRole('link', { name: 'Cart (2)' })).toBeVisible();
  });
});

test.describe('Cart management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Ceramic Mug to cart' }).click();

    // Navigate the way a real user would by clicking the cart link
    await page.getByRole('link', { name: 'Cart (1)' }).click();
    await expect(page.getByRole('heading', { name: 'Your Cart' })).toBeVisible();
  });

  test('increases and decreases the quantity of an item', async ({ page }) => {
    const quantity = page.locator('[aria-label="Quantity of Ceramic Mug"]');

    await page.getByRole('button', { name: 'Increase quantity of Ceramic Mug' }).click();
    await expect(quantity).toHaveText('2');

    await page.getByRole('button', { name: 'Decrease quantity of Ceramic Mug' }).click();
    await expect(quantity).toHaveText('1');
  });

  test('does not let quantity drop below 1', async ({ page }) => {
    const quantity = page.locator('[aria-label="Quantity of Ceramic Mug"]');
    const decreaseButton = page.getByRole('button', { name: 'Decrease quantity of Ceramic Mug' });

    // Already at quantity 1, so clicking decrease should not do anything
    await decreaseButton.click();
    await decreaseButton.click();

    await expect(quantity).toHaveText('1');
  });

  test('removes an item from the cart', async ({ page }) => {
    await page.getByRole('button', { name: 'Remove Ceramic Mug from cart' }).click();

    await expect(page.getByText('Your cart is empty.')).toBeVisible();
  });

  test('applies a valid discount code and updates the total', async ({ page }) => {
    await page.getByLabel('Discount code').fill('SAVE10');
    await page.getByRole('button', { name: 'Apply' }).click();

    await expect(page.getByRole('status')).toHaveText('Code SAVE10 applied!');
    await expect(page.getByText('-$1.45', { exact: true })).toBeVisible();
  });

  test('shows an error for an invalid discount code', async ({ page }) => {
    await page.getByLabel('Discount code').fill('invalid10CODE');
    await page.getByRole('button', { name: 'Apply' }).click();

    await expect(page.getByRole('alert')).toHaveText('That discount code is not valid.');
  });
});

