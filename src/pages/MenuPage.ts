import type { Locator, Page } from '@playwright/test';
import { AddToCartDialog } from '../components/AddToCartDialog';
import { PromoModal } from '../components/PromoModal';
import { toTestId } from '../utils/text';
import { BasePage } from './BasePage';

export type PromoChoice = 'accept' | 'decline';

/** The promo pop-up appears on every 3rd item added to the cart (3, 6, 9...). */
export const PROMO_INTERVAL = 3;

/** The home page: the list of coffees. */
export class MenuPage extends BasePage {
  readonly promo: PromoModal;
  readonly addToCartDialog: AddToCartDialog;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.promo = new PromoModal(page);
    this.addToCartDialog = new AddToCartDialog(page);
    this.checkoutButton = page.getByTestId('checkout');
  }

  /** Opens the app. `query` is for the app's test modes, e.g. '?ad=1' or '?breakable=1'. */
  async open(query = ''): Promise<void> {
    await this.page.goto(`/${query}`);
    await this.checkoutButton.waitFor();
  }

  /** The clickable coffee cup, e.g. cup('Espresso Macchiato'). */
  cup(productName: string): Locator {
    return this.page.getByTestId(toTestId(productName));
  }

  /** The list item that holds the title, price and cup of one coffee. */
  private item(productName: string): Locator {
    return this.page.locator('li').filter({ has: this.cup(productName) });
  }

  /** The coffee title (changes language after a double-click). */
  title(productName: string): Locator {
    return this.item(productName).getByRole('heading');
  }

  async add(productName: string): Promise<void> {
    await this.cup(productName).click();
  }

  /**
   * Adds products one by one and answers the promo pop-up whenever it is expected.
   * The pop-up appears on every 3rd item (3, 6, 9...), so we wait for it on those
   * adds only. Note: the app slows down on purpose when the cart has more than 7 items. Use it with 'decline' when adding more than 3 items, because
   * accepting puts an extra discounted item in the cart.
   */
  async addProducts(productNames: string[], promoChoice: PromoChoice = 'decline'): Promise<void> {
    for (const [index, name] of productNames.entries()) {
      await this.add(name);
      const promoExpected = (index + 1) % PROMO_INTERVAL === 0;
      if (promoExpected) {
        await this.promo.message.waitFor();
        await (promoChoice === 'accept' ? this.promo.accept() : this.promo.decline());
      }
    }
  }

  async doubleClickTitle(productName: string): Promise<void> {
    await this.title(productName).dblclick();
  }

  async rightClickCup(productName: string): Promise<void> {
    await this.cup(productName).click({ button: 'right' });
  }
}
