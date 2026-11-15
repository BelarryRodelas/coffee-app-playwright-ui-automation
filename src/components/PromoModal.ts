import type { Locator, Page } from '@playwright/test';

/** The "lucky day" offer that appears when every 3rd item is added to the cart. */
export class PromoModal {
  readonly message: Locator;
  readonly acceptButton: Locator;
  readonly declineButton: Locator;

  constructor(page: Page) {
    this.message = page.getByText(/it's your lucky day/i);
    this.acceptButton = page.getByRole('button', { name: /yes, of course/i });
    this.declineButton = page.getByRole('button', { name: /skip/i });
  }

  async accept(): Promise<void> {
    await this.acceptButton.click();
  }

  async decline(): Promise<void> {
    await this.declineButton.click();
  }
}
