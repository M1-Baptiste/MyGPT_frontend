// e2e/conversations.spec.ts
import { test, expect } from '@playwright/test';
import { login } from './utils';

test('1. Affichage de la liste des conversations', async ({ page }) => {
    await login(page); // Connecte l'utilisateur
    await expect(page.locator('.conversation-list')).toBeVisible(); // Vérifie que la liste des conversations est visible
});

test('2. Création d’une nouvelle conversation', async ({ page }) => {
    await login(page); // Connecte l'utilisateur

    // Clique sur le bouton pour créer une nouvelle conversation
    await page.click('button:has-text("New Conversation")');

    // Remplis le formulaire de création
    await page.fill('input[name="conversationName"]', 'Conversation Test');
    await page.click('button:has-text("Create")');

    // Vérifie que la conversation apparaît dans la liste
    await expect(page.locator('.conversation-list')).toContainText('Conversation Test');
});

test('3. Suppression d’une conversation', async ({ page }) => {
    await login(page); // Connecte l'utilisateur

    // Trouve une conversation et clique sur "Delete"
    const conversation = page.locator('.conversation-item').first();
    await conversation.locator('button:has-text("Delete")').click();

    // Vérifie que la conversation a été supprimée
    await expect(conversation).not.toBeVisible();
});
