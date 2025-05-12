import { test, expect } from '@playwright/test';
import { login } from './utils';

test('1. Envoi d’un message et réception de la réponse', async ({ page }) => {
    await login(page);

    // Envoi du message
    await page.fill('input[placeholder="Type your message..."]', 'Bonjour !');
    await page.click('button:has-text("Send")');

    // Vérifie que le message envoyé apparaît
    await expect(page.locator('.bg-blue-100')).toContainText('Bonjour');

    // Vérifie que la réponse de l'IA est visible
    await expect(page.locator('.bg-green-100')).toBeVisible();
});

test('2. Édition d’un message existant', async ({ page }) => {
    await login(page); // Connecte l'utilisateur

    // Trouve un message envoyé par l'utilisateur
    const userMessage = page.locator('.bg-blue-100').first();

    // Clique sur "Edit" pour modifier le message
    await userMessage.locator('text=Edit').click();
    await page.fill('input[placeholder="Type your message..."]', 'Message édité');
    await page.click('button:has-text("Send")');

    // Vérifie que le message a été modifié
    await expect(userMessage).toContainText('Message édité');
});

test('3. Suppression d’un message', async ({ page }) => {
    await login(page); // Connecte l'utilisateur

    // Trouve un message à supprimer
    const messageToDelete = page.locator('.bg-blue-100').first();

    // Clique sur "Delete" pour supprimer le message
    await messageToDelete.locator('button:has-text("Delete")').click();

    // Vérifie que le message n'est plus visible
    await expect(messageToDelete).not.toBeVisible();
});
