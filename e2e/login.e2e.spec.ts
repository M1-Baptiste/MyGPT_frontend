import { test, expect, Page, Locator } from '@playwright/test';

// Décrire la suite de tests pour la page de connexion
test.describe('Tests E2E pour la page de connexion', () => {
    // Configuration avant chaque test
    test.beforeEach(async ({ page }: { page: Page }) => {
        // Naviguer vers la page de connexion avant chaque test
        await page.goto('http://localhost:5173/login');
    });

    // Test pour vérifier une connexion réussie avec des identifiants valides
    test('doit se connecter avec succès avec des identifiants valides', async ({ page }: { page: Page }) => {
        // Simuler la réponse de l'API pour une connexion réussie
        await page.route('http://localhost:8080/api/auth/login', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ token: 'mock-token' }),
            });
        });

        // Remplir le formulaire
        await page.fill('input[id="email"]', 'test@example.com');
        await page.fill('input[id="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Vérifier la redirection vers la page des conversations
        await expect(page).toHaveURL('http://localhost:5173/conversations');
    });

    // Test pour vérifier l'affichage d'une erreur en cas d'identifiants invalides
    test('doit afficher une erreur pour des identifiants invalides', async ({ page }: { page: Page }) => {
        // Simuler la réponse de l'API pour une connexion échouée
        await page.route('http://localhost:8080/api/auth/login', async (route) => {
            await route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Email ou mot de passe invalide' }),
            });
        });

        // Remplir le formulaire avec des identifiants invalides
        await page.fill('input[id="email"]', 'wrong@example.com');
        await page.fill('input[id="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        // Vérifier que le message d'erreur est affiché
        const errorMessage: Locator = page.locator('.bg-red-50 .text-red-700');
        await expect(errorMessage).toHaveText('Email ou mot de passe invalide');
    });

    // Test pour empêcher la soumission d'un formulaire vide
    test('doit empêcher la soumission avec un formulaire vide', async ({ page }: { page: Page }) => {
        // Cliquer sur le bouton de soumission sans remplir le formulaire
        await page.click('button[type="submit"]');

        // Vérifier que la page ne change pas
        await expect(page).toHaveURL('http://localhost:5173/login');

        // Vérifier que les champs requis affichent une validation
        const emailInput: Locator = page.locator('input[id="email"]');
        const passwordInput: Locator = page.locator('input[id="password"]');
        await expect(emailInput).toHaveAttribute('required', '');
        await expect(passwordInput).toHaveAttribute('required', '');
    });

    // Test pour naviguer vers la page d'inscription
    test('doit naviguer vers la page d\'inscription', async ({ page }: { page: Page }) => {
        // Cliquer sur le lien "S'inscrire"
        await page.click('a[href="/register"]');

        // Vérifier la navigation vers la page d'inscription
        await expect(page).toHaveURL('http://localhost:5173/register');
    });

    // Test pour vérifier le style du message d'erreur
    test('doit afficher correctement le style du message d\'erreur', async ({ page }: { page: Page }) => {
        // Simuler la réponse de l'API pour une connexion échouée
        await page.route('http://localhost:8080/api/auth/login', async (route) => {
            await route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Email ou mot de passe invalide' }),
            });
        });

        // Remplir le formulaire et soumettre
        await page.fill('input[id="email"]', 'wrong@example.com');
        await page.fill('input[id="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        // Vérifier le style du conteneur du message d'erreur
        const errorContainer: Locator = page.locator('.bg-red-50.border-l-4.border-red-400');
        await expect(errorContainer).toBeVisible();
        await expect(errorContainer).toHaveClass(/bg-red-50/);
        await expect(errorContainer).toHaveClass(/border-red-400/);
    });
});