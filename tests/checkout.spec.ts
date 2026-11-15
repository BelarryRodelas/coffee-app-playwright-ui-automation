import { products } from '../src/data';
import { expect, test } from '../src/fixtures';
import { totalText } from '../src/utils/text';

test.describe('Checkout', () => {
  test(
    'customer can buy a coffee and sees the purchase confirmation',
    { tag: '@smoke' },
    async ({ menuPage, cartPage, customer }) => {
      const { espresso } = products;

      await test.step('Add a product (promo pop-up is not expected for the 1st item)', async () => {
        await menuPage.addProducts([espresso.name]);
        await expect(menuPage.header.cartLink).toContainText('(1)');
        await expect(menuPage.promo.message).toBeHidden();
      });

      await test.step('Review the cart', async () => {
        await menuPage.header.goToCart();
        await expect(cartPage.row(espresso.name)).toBeVisible();
        await expect(cartPage.checkoutButton).toContainText(totalText(espresso.price));
      });

      await test.step('Submit payment details', async () => {
        await cartPage.startCheckout();
        await expect(cartPage.paymentModal.heading).toBeVisible();
        await cartPage.paymentModal.fill(customer);
        await cartPage.paymentModal.submit();
      });

      await test.step('Verify the purchase succeeded', async () => {
        await expect(cartPage.purchaseSuccessMessage).toBeVisible();
        await expect(cartPage.header.cartLink).toContainText('(0)');
      });
    },
  );

  test('cart total is the sum of several products', async ({ menuPage, cartPage }) => {
    const { espresso, mocha } = products;

    await menuPage.addProducts([espresso.name, mocha.name]);
    await menuPage.header.goToCart();

    await expect(cartPage.row(espresso.name)).toBeVisible();
    await expect(cartPage.row(mocha.name)).toBeVisible();
    await expect(cartPage.checkoutButton).toContainText(totalText(espresso.price + mocha.price));
  });

  test('customer can complete checkout after declining the promo offer', async ({
    menuPage,
    cartPage,
    customer,
  }) => {
    const { espresso, mocha, americano } = products;

    await menuPage.addProducts([espresso.name, mocha.name, americano.name], 'decline');
    await expect(menuPage.header.cartLink).toContainText('(3)');

    await menuPage.header.goToCart();
    await cartPage.startCheckout();
    await cartPage.paymentModal.fill(customer);
    await cartPage.paymentModal.submit();

    await expect(cartPage.purchaseSuccessMessage).toBeVisible();
    await expect(cartPage.header.cartLink).toContainText('(0)');
  });
});
