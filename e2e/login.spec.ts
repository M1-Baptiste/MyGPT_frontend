import { test, expect } from '@playwright/test';

test('1. Connexion avec identifiants valides', async ({ page }) => {
    await page.goto('http://localhost:5174/login');
    await page.fill('input[type="email"]', 'test@test.fr');
    await page.fill('input[type="password"]', 'test');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:5174/conversations', { timeout: 10000 });
});

test('2. Connexion avec mot de passe invalide', async ({ page }) => {
    await page.goto('http://localhost:5174/login');
    await page.fill('input[type="email"]', 'test@test.fr');
    await page.fill('input[type="password"]', 'mauvaismdp');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error')).toContainText('Identifiants incorrects', { timeout: 5000 });
});

test('3. Redirection si déjà connecté', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5174/login');
    await page.fill('input[type="email"]', 'test@test.fr');
    await page.fill('input[type="password"]', 'test');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:5174/conversations', { timeout: 10000 });

    // Try accessing login again
    await page.goto('http://localhost:5174/login');
    await page.waitForURL('http://localhost:5174/conversations', { timeout: 10000 });
});