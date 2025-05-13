import { test, expect, Page, Locator } from '@playwright/test';

// Define types for mock data
interface Message {
  id: string;
  content: string;
  userMessage: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

test.describe('Chat Component E2E Tests', () => {
  // Mock conversation data
  const mockConversation: Conversation = {
    id: '1',
    title: 'Test Conversation',
    messages: [
      {
        id: '1',
        content: 'Hello, how can I help you?',
        userMessage: false,
        createdAt: '2025-05-13T10:00:00Z',
      },
      {
        id: '2',
        content: 'I have a question about coding.',
        userMessage: true,
        createdAt: '2025-05-13T10:01:00Z',
      },
      {
        id: '3',
        content: '```javascript\nconsole.log("Hello World");\n```',
        userMessage: false,
        createdAt: '2025-05-13T10:02:00Z',
      },
    ],
  };

  // Mock search results
  const mockSearchResults: Message[] = [
    {
      id: '2',
      content: 'I have a question about coding.',
      userMessage: true,
      createdAt: '2025-05-13T10:01:00Z',
    },
  ];

  // Mock new message response
  const mockNewMessages: Message[] = [
    {
      id: '4',
      content: 'Test message',
      userMessage: true,
      createdAt: '2025-05-13T10:03:00Z',
    },
    {
      id: '5',
      content: 'AI response to test message',
      userMessage: false,
      createdAt: '2025-05-13T10:03:01Z',
    },
  ];

  test.beforeEach(async ({ page }: { page: Page }) => {
    // Navigate to the login page
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 30000 });

    // Clear localStorage to reset state
    await page.evaluate(() => window.localStorage.clear());

    // Set localStorage token
    await page.evaluate(() => {
      window.localStorage.setItem('token', 'mock-token');
    });

    // Mock API calls
    await page.route('http://localhost:8080/api/conversations/1', async (route) => {
      console.log('Mock conversation:', mockConversation);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockConversation),
      });
    });

    await page.route('http://localhost:8080/api/conversations/1/messages', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockNewMessages),
        });
      }
    });

    await page.route('http://localhost:8080/api/conversations/1/messages/search?keyword=coding', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSearchResults),
      });
    });

    // Simulate navigation to the conversation page
    await page.evaluate(() => {
      window.location.href = '/conversations/1';
    });

    // Wait for the chat page to load
    await page.waitForURL('http://localhost:5173/conversations/1', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  });

  test('should display conversation, send message, search, copy code, and logout', async ({ page }: { page: Page }) => {
    // Verify conversation title
    const title: Locator = page.locator('h1:has-text("Mon ChatGPT - Test Conversation")');
    await expect(title).toBeVisible({ timeout: 10000 });

    // Verify initial messages (use a more specific locator)
    const messages: Locator = page.locator('.space-y-4 > div[data-message-id]');
    console.log('Message elements:', await messages.allTextContents());
    await expect(messages).toHaveCount(3);
    await expect(messages.nth(0).locator('p.text-base')).toHaveText('Hello, how can I help you?');
    await expect(messages.nth(1).locator('p.text-base')).toHaveText('I have a question about coding.');
    await expect(messages.nth(2).locator('pre code')).toHaveText('console.log("Hello World");');

    // Send a new message
    await page.locator('input[placeholder="Type your message..."]').fill('Test message');
    await page.locator('button[type="submit"]').click();
    await expect(messages).toHaveCount(5); // Initial 3 + 2 new messages
    await expect(messages.nth(3).locator('p.text-base')).toHaveText('Test message');
    await expect(messages.nth(4).locator('p.text-base')).toHaveText('AI response to test message');

    // Search for messages
    await page.locator('input[placeholder="Search messages in this conversation..."]').fill('coding');
    await page.waitForTimeout(500); // Wait for search debounce
    await expect(messages).toHaveCount(1);
    await expect(messages.nth(0).locator('p.text-base')).toHaveText('I have a question about coding.');

    // Copy code block
    await page.locator('input[placeholder="Search messages in this conversation..."]').clear();
    await page.waitForTimeout(500); // Wait for messages to reload
    // Mock clipboard for consistent testing
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: async (text: string) => {
            (window as any).copiedText = text;
          },
          readText: async () => (window as any).copiedText,
        },
      });
    });
    await page.locator('button:has-text("Copy Code")').click();
    const clipboardContent: string = await page.evaluate(() => navigator.clipboard.readText());
    await expect(clipboardContent).toBe('console.log("Hello World");');

    // Logout
    await page.locator('button.bg-red-500:has-text("Logout")').click();
    await page.waitForURL('http://localhost:5173/login', { timeout: 10000 });
    await expect(page).toHaveURL('http://localhost:5173/login');
    const token: string | null = await page.evaluate(() => window.localStorage.getItem('token'));
    await expect(token).toBeNull();
  });
});