import type { Locator, Page } from '@playwright/test';
import type { Customer } from '../data/types';

/** The "Payment details" form that opens after clicking the Total button. */
export class PaymentModal {
  readonly heading: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly promotionCheckbox: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.heading = page.getByRole('heading', { name: 'Payment details' });
    this.nameInput = page.locator('#name');
    this.emailInput = page.locator('#email');
    this.promotionCheckbox = page.locator('#promotion');
    this.submitButton = page.getByRole('button', { name: 'Submit' });
  }

  async fill(customer: Customer): Promise<void> {
    await this.nameInput.fill(customer.name);
    await this.emailInput.fill(customer.email);
    await this.promotionCheckbox.setChecked(customer.subscribeToPromotions);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
