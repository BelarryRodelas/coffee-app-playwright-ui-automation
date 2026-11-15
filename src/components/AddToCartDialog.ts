import type { Locator, Page } from '@playwright/test';

/** The confirmation dialog that opens when you right-click a coffee. */
export class AddToCartDialog {
  readonly yesButton: Locator;
  readonly noButton: Locator;

  constructor(private readonly page: Page) {
    this.yesButton = page.getByRole('button', { name: 'Yes', exact: true });
    this.noButton = page.getByRole('button', { name: 'No', exact: true });
  }

  /** The question text, e.g. "Add Espresso to the cart?" */
  messageFor(productName: string): Locator {
    return this.page.getByText(`Add ${productName} to the cart?`);
  }

  async confirm(): Promise<void> {
    await this.yesButton.click();
  }

  async cancel(): Promise<void> {
    await this.noButton.click();
  }
}
