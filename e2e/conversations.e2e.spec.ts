import { test, expect, Page, Locator } from '@playwright/test';

// Décrire la suite de tests pour la page des conversations
test.describe('Tests E2E pour la page des conversations', () => {
    // Configuration avant chaque test
    test.beforeEach(async ({ page }: { page: Page }) => {
        // Naviguer vers une page neutre pour définir le jeton
        await page.goto('http://localhost:5173/login');

        // Attendre que la page soit complètement chargée
        await page.waitForLoadState('networkidle');

        // Définir un jeton fictif pour simuler l'authentification
        await page.evaluate(() => {
            window.localStorage.setItem('token', 'mock-token');
        });

        // Simuler la réponse de l'API pour récupérer les conversations
        await page.route('http://localhost:8080/api/conversations', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        id: 1,
                        title: 'Conversation de test',
                        createdAt: '2023-10-01T10:00:00Z',
                    },
                ]),
            });
        });

        // Naviguer vers la page des conversations
        await page.goto('http://localhost:5173/conversations');

        // Attendre que la page soit chargée et vérifier l'URL
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL('http://localhost:5173/conversations');
    });

    // Test pour vérifier la déconnexion
    test('doit se déconnecter avec succès', async ({ page }: { page: Page }) => {
        // Attendre le bouton de déconnexion et cliquer dessus
        await page.waitForSelector('button.bg-red-500:has-text("Déconnexion")', { timeout: 10000 });
        await page.click('button.bg-red-500:has-text("Déconnexion")');

        // Vérifier la redirection vers la page de connexion
        await expect(page).toHaveURL('http://localhost:5173/login');
    });

    // Test pour créer une nouvelle conversation
    test('doit créer une nouvelle conversation', async ({ page }: { page: Page }) => {
        // Simuler la réponse de l'API pour la création d'une conversation
        await page.route('http://localhost:8080/api/conversations', async (route) => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        id: 2,
                        title: 'Nouvelle conversation',
                        createdAt: '2023-10-02T10:00:00Z',
                    }),
                });
            }
        });

        // Ouvrir la modale de création de conversation
        await page.waitForSelector('button.bg-indigo-600:has-text("Nouvelle Conversation")', { timeout: 10000 });
        await page.click('button.bg-indigo-600:has-text("Nouvelle Conversation")');

        // Remplir le formulaire et soumettre
        await page.fill('input[id="title"]', 'Nouvelle conversation');
        await page.click('button.bg-indigo-600:has-text("Créer")');

        // Vérifier que la nouvelle conversation apparaît dans la liste
        const conversationTitle: Locator = page.locator('h3:has-text("Nouvelle conversation")');
        await expect(conversationTitle).toBeVisible();

        // Vérifier la notification (alerte)
        await page.waitForEvent('dialog', async (dialog) => {
            expect(dialog.message()).toBe('Conversation créée avec succès');
            await dialog.accept();
            return true;
        });
    });

    // Test pour rechercher des conversations
    test('doit rechercher des conversations', async ({ page }: { page: Page }) => {
        // Simuler la réponse de l'API pour la recherche de conversations
        await page.route('http://localhost:8080/api/conversations/search**', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        id: 3,
                        title: 'Conversation résultat de recherche',
                        createdAt: '2023-10-03T10:00:00Z',
                    },
                ]),
            });
        });

        // Saisir un terme de recherche
        await page.waitForSelector('input[placeholder="Rechercher une conversation..."]', { timeout: 10000 });
        await page.fill('input[placeholder="Rechercher une conversation..."]', 'terme de recherche');
        await page.press('input[placeholder="Rechercher une conversation..."]', 'Enter');

        // Vérifier que le résultat de la recherche apparaît
        const searchResult: Locator = page.locator('h3:has-text("Conversation résultat de recherche")');
        await expect(searchResult).toBeVisible();
    });

    // Test pour partager une conversation
    test('doit partager une conversation', async ({ page }: { page: Page }) => {
        // Simuler la réponse de l'API pour le partage d'une conversation
        await page.route('http://localhost:8080/api/conversations/1/share', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ link: 'http://localhost:5173/conversations/1/share' }),
            });
        });

        // Intercepter l'appel au presse-papiers
        let copiedText = '';
        await page.evaluate(() => {
            Object.defineProperty(navigator, 'clipboard', {
                value: {
                    writeText: async (text: string) => {
                        (window as any).copiedText = text;
                    },
                },
            });
        });

        // Cliquer sur le bouton de partage
        await page.waitForSelector('button.bg-amber-500:has-text("Partager")', { timeout: 10000 });
        await page.click('button.bg-amber-500:has-text("Partager")');

        // Vérifier le contenu copié
        copiedText = await page.evaluate(() => (window as any).copiedText);
        await expect(copiedText).toBe('http://localhost:5173/conversations/1/share');

        // Vérifier la notification (alerte)
        await page.waitForEvent('dialog', async (dialog) => {
            expect(dialog.message()).toBe('Lien de partage copié dans le presse-papiers');
            await dialog.accept();
            return true;
        });
    });

    // Test pour naviguer vers les détails d'une conversation
    test('doit naviguer vers les détails d’une conversation', async ({ page }: { page: Page }) => {
        // Cliquer sur le bouton "Voir"
        await page.waitForSelector('a.bg-emerald-500:has-text("Voir")', { timeout: 10000 });
        await page.click('a.bg-emerald-500:has-text("Voir")');

        // Vérifier la navigation vers la page des détails de la conversation
        await expect(page).toHaveURL('http://localhost:5173/conversations/1');
    });
});