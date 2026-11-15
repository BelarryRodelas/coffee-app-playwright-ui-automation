import type { Locator, Page } from '@playwright/test';
import { PaymentModal } from '../components/PaymentModal';
import { BasePage } from './BasePage';

/** The cart page (/cart). Reach it with header.goToCart(), not page.goto(). */
export class CartPage extends BasePage {
  readonly paymentModal: PaymentModal;
  readonly checkoutButton: Locator;
  readonly purchaseSuccessMessage: Locator;
  readonly emptyCartMessage: Locator;
  private readonly rows: Locator;

  constructor(page: Page) {
    super(page);
    this.paymentModal = new PaymentModal(page);
    this.checkoutButton = page.getByTestId('checkout');
    this.purchaseSuccessMessage = page.getByText(/thanks for your purchase/i);
    this.emptyCartMessage = page.getByText('No coffee, go add some.');
    // getByRole skips hidden elements, so the hidden "cart preview" list that
    // duplicates the items on this page is not matched.
    this.rows = page.getByRole('listitem');
  }

  /** The row for one product (exact name match, so "Espresso" never matches "Espresso Macchiato"). */
  row(productName: string): Locator {
    return this.rows.filter({ has: this.page.getByText(productName, { exact: true }) });
  }

  /** Rows added by the promo pop-up are labelled "(Discounted)". */
  get discountedRows(): Locator {
    return this.rows.filter({ hasText: '(Discounted)' });
  }

  async startCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
