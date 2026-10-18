import { expect, test } from '@playwright/test';

test.describe('Tool - Hash compare', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/hash-compare');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Hash compare - IT Tools');
  });

  test('Detects a matching hash', async ({ page }) => {
    await page.getByPlaceholder('Your text to compare...').fill('hello');
    await page.getByTestId('hash-to-compare').fill('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');

    expect(await page.getByTestId('compare-result').textContent()).toEqual('Yes');
  });

  test('Detects a matching hash regardless of case', async ({ page }) => {
    await page.getByPlaceholder('Your text to compare...').fill('hello');
    await page.getByTestId('hash-to-compare').fill('2CF24DBA5FB0A30E26E83B2AC5B9E29E1B161E5C1FA7425E73043362938B9824');

    expect(await page.getByTestId('compare-result').textContent()).toEqual('Yes');
  });

  test('Detects a non-matching hash', async ({ page }) => {
    await page.getByPlaceholder('Your text to compare...').fill('hello');
    await page.getByTestId('hash-to-compare').fill('0000000000000000000000000000000000000000000000000000000000000000');

    expect(await page.getByTestId('compare-result').textContent()).toEqual('No');
  });

  test('Compares the hash of an empty text', async ({ page }) => {
    await page.getByTestId('hash-to-compare').fill('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

    expect(await page.getByTestId('compare-result').textContent()).toEqual('Yes');
  });

  test('Hides the result until a hash is provided', async ({ page }) => {
    await page.getByPlaceholder('Your text to compare...').fill('hello');

    await expect(page.getByTestId('compare-result')).not.toBeVisible();
  });
});
