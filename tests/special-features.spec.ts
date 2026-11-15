import { products, translations } from '../src/data';
import { expect, test } from '../src/fixtures';

test.describe('Special features', () => {
  // One test per row in test-data/translations.json
  for (const { product, chinese } of translations) {
    test(`double-clicking the "${product}" title translates it to Chinese`, async ({ menuPage }) => {
      await expect(menuPage.title(product)).not.toContainText(chinese);

      await menuPage.doubleClickTitle(product);

      await expect(menuPage.title(product)).toContainText(chinese);
    });
  }

  test('right-clicking a coffee and confirming adds it to the cart', async ({ menuPage }) => {
    const { mocha } = products;

    await menuPage.rightClickCup(mocha.name);
    await expect(menuPage.addToCartDialog.messageFor(mocha.name)).toBeVisible();
    await menuPage.addToCartDialog.confirm();

    await expect(menuPage.header.cartLink).toContainText('(1)');
  });

  test('right-clicking a coffee and cancelling does not add it', async ({ menuPage }) => {
    const { mocha } = products;

    await menuPage.rightClickCup(mocha.name);
    await expect(menuPage.addToCartDialog.messageFor(mocha.name)).toBeVisible();
    await menuPage.addToCartDialog.cancel();

    await expect(menuPage.addToCartDialog.messageFor(mocha.name)).toBeHidden();
    await expect(menuPage.header.cartLink).toContainText('(0)');
  });
});
