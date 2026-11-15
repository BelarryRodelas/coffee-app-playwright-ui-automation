import { test as base, expect } from '@playwright/test';
import { buildCustomer } from '../data';
import type { Customer } from '../data/types';
import { CartPage } from '../pages/CartPage';
import { MenuPage } from '../pages/MenuPage';

type Fixtures = {
  /** Optional query string for the app's test modes, e.g. '?ad=1'. Set with test.use(). */
  appQuery: string;
  /** Menu page that is already open and ready to use. */
  menuPage: MenuPage;
  /** Cart page object. It does not navigate: use menuPage.header.goToCart(). */
  cartPage: CartPage;
  /** A customer with a unique email address for this test only. */
  customer: Customer;
  /** Runs automatically in every test and attaches browser errors to the report. */
  browserDiagnostics: void;
};

export const test = base.extend<Fixtures>({
  appQuery: ['', { option: true }],

  menuPage: async ({ page, appQuery }, use) => {
    const menuPage = new MenuPage(page);
    await menuPage.open(appQuery); // setup
    await use(menuPage);
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  customer: async ({}, use) => {
    await use(buildCustomer());
  },

  browserDiagnostics: [
    async ({ page }, use, testInfo) => {
      const messages: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') messages.push(`[console.error] ${msg.text()}`);
      });
      page.on('pageerror', (error) => messages.push(`[pageerror] ${error.message}`));

      await use();

      // teardown: keep the evidence next to the test result
      if (messages.length > 0) {
        await testInfo.attach('browser-errors', {
          body: messages.join('\n'),
          contentType: 'text/plain',
        });
      }
    },
    { auto: true },
  ],
});

export { expect };
