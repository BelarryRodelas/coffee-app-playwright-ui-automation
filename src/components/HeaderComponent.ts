import type { Locator, Page } from '@playwright/test';

/** The navigation bar shown on every page. */
export class HeaderComponent {
  readonly cartLink: Locator;
  readonly menuLink: Locator;

  constructor(private readonly page: Page) {
    // The app keeps the cart in memory, so we must navigate with its own links
    // (page.goto('/cart') would reload the app and empty the cart).
    this.cartLink = page.locator('a[href="/cart"]');
    this.menuLink = page.locator('a[href="/"]');
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
    await this.page.waitForURL('**/cart');
  }

  async goToMenu(): Promise<void> {
    await this.menuLink.click();
    await this.page.waitForURL((url) => url.pathname === '/');
  }
}
