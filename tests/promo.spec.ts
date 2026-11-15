import { products, promo } from '../src/data';
import { PROMO_INTERVAL } from '../src/pages/MenuPage';
import { expect, test } from '../src/fixtures';
import { totalText } from '../src/utils/text';

test.describe('Promo pop-up (every 3rd item)', () => {
  test('appears on the 3rd, 6th and 9th item and on no other', async ({ menuPage }) => {
    // The app slows down on purpose when the cart has more than 7 items,
    // so this 9-item test gets a longer timeout instead of a sleep.
    test.slow();

    for (let itemNumber = 1; itemNumber <= 9; itemNumber++) {
      await menuPage.add(products.espresso.name);

      if (itemNumber % PROMO_INTERVAL === 0) {
        await expect(menuPage.promo.message, `promo expected on item ${itemNumber}`).toBeVisible();
        await menuPage.promo.decline();
        await expect(menuPage.promo.message).toBeHidden();
      } else {
        await expect(menuPage.promo.message, `no promo expected on item ${itemNumber}`).toBeHidden();
      }
    }
  });

  test('accepting the offer adds one discounted item to the cart', async ({ menuPage, cartPage }) => {
    const { espresso, mocha, americano } = products;
    const chosenTotal = espresso.price + mocha.price + americano.price;

    await menuPage.addProducts([espresso.name, mocha.name, americano.name], 'accept');
    await expect(menuPage.header.cartLink).toContainText('(4)');

    await menuPage.header.goToCart();
    await expect(cartPage.discountedRows).toHaveCount(1);
    await expect(cartPage.checkoutButton).toContainText(totalText(chosenTotal + promo.extraItemPrice));
  });

  test('declining the offer leaves the cart with the 3 chosen items', async ({ menuPage, cartPage }) => {
    const { espresso, mocha, americano } = products;
    const chosenTotal = espresso.price + mocha.price + americano.price;

    await menuPage.addProducts([espresso.name, mocha.name, americano.name], 'decline');
    await expect(menuPage.header.cartLink).toContainText('(3)');

    await menuPage.header.goToCart();
    await expect(cartPage.discountedRows).toHaveCount(0);
    await expect(cartPage.checkoutButton).toContainText(totalText(chosenTotal));
  });
});
