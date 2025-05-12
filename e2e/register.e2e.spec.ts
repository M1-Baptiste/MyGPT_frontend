import { test, expect, Page, Locator } from '@playwright/test';

// Décrire la suite de tests pour la page d'inscription
test.describe('Tests E2E pour la page d\'inscription', () => {
    // Configuration avant chaque test
    test.beforeEach(async ({ page }: { page: Page }) => {
        // Naviguer vers la page d'inscription avant chaque test
        await page.goto('http://localhost:5173/register');
    });

    // Test pour vérifier une inscription réussie avec des identifiants valides
    test('doit s\'inscrire avec succès avec des identifiants valides', async ({ page }: { page: Page }) => {
        // Simuler la réponse de l'API pour une inscription réussie
        await page.route('http://localhost:8080/api/auth/register', async (route) => {
            await route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Inscription réussie' }),
            });
        });

        // Remplir le formulaire
        await page.fill('input[id="email"]', 'newuser@example.com');
        await page.fill('input[id="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Vérifier la redirection vers la page de connexion
        await expect(page).toHaveURL('http://localhost:5173/login');
    });

    // Test pour vérifier l'affichage d'une erreur en cas d'inscription invalide
    test('doit afficher une erreur pour une inscription invalide', async ({ page }: { page: Page }) => {
        // Simuler la réponse de l'API pour une inscription échouée
        await page.route('http://localhost:8080/api/auth/register', async (route) => {
            await route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({ message: "L'email existe déjà" }),
            });
        });

        // Remplir le formulaire avec des données invalides
        await page.fill('input[id="email"]', 'existing@example.com');
        await page.fill('input[id="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Vérifier que le message d'erreur est affiché
        const errorMessage: Locator = page.locator('.bg-red-50 .text-red-700');
        await expect(errorMessage).toHaveText("L'email existe déjà");
    });

    // Test pour empêcher la soumission d'un formulaire vide
    test('doit empêcher la soumission avec un formulaire vide', async ({ page }: { page: Page }) => {
        // Cliquer sur le bouton de soumission sans remplir le formulaire
        await page.click('button[type="submit"]');

        // Vérifier que la page ne change pas
        await expect(page).toHaveURL('http://localhost:5173/register');

        // Vérifier que les champs requis affichent une validation
        const emailInput: Locator = page.locator('input[id="email"]');
        const passwordInput: Locator = page.locator('input[id="password"]');
        await expect(emailInput).toHaveAttribute('required', '');
        await expect(passwordInput).toHaveAttribute('required', '');
    });

    // Test pour naviguer vers la page de connexion
    test('doit naviguer vers la page de connexion', async ({ page }: { page: Page }) => {
        // Cliquer sur le lien "Se connecter"
        await page.click('a[href="/login"]');

        // Vérifier la navigation vers la page de connexion
        await expect(page).toHaveURL('http://localhost:5173/login');
    });

    // Test pour vérifier le style du message d'erreur
    test('doit afficher correctement le style du message d\'erreur', async ({ page }: { page: Page }) => {
        // Simuler la réponse de l'API pour une inscription échouée
        await page.route('http://localhost:8080/api/auth/register', async (route) => {
            await route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({ message: "L'email existe déjà" }),
            });
        });

        // Remplir le formulaire et soumettre
        await page.fill('input[id="email"]', 'existing@example.com');
        await page.fill('input[id="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Vérifier le style du conteneur du message d'erreur
        const errorContainer: Locator = page.locator('.bg-red-50.border-l-4.border-red-400');
        await expect(errorContainer).toBeVisible();
        await expect(errorContainer).toHaveClass(/bg-red-50/);
        await expect(errorContainer).toHaveClass(/border-red-400/);
    });
});