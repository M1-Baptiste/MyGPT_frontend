import {Page} from "@playwright/test";

export async function login(page: Page) {
    await page.goto('http://localhost:5174/login');
    await page.fill('input[type="email"]', 'test@test.fr');
    await page.fill('input[type="password"]', 'test');
    await page.click('button[type="submit"]');
    let alertMessage;
    page.on('dialog', async dialog => {
        alertMessage = dialog.message();
        await dialog.accept();
    });
    await page.waitForTimeout(1000); // Wait for potential alert
    if (alertMessage) {
        throw new Error(`Login failed: ${alertMessage}`);
    }
    await page.waitForURL('http://localhost:5174/conversations', { timeout: 60000 });
}