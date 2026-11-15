import { messages, products } from '../src/data';
import { expect, test } from '../src/fixtures';

// These cover the app's built-in test modes described in the app notes.
test.describe('Resilience modes', () => {
  test.describe('slow page load with ads (?ad=1)', () => {
    test.slow(); // ads slow the page down on purpose: give the test more time, no sleeps
    test.use({ appQuery: '?ad=1' });

    test('menu is still usable and a coffee can be added', async ({ menuPage }) => {
      await menuPage.add(products.espresso.name);

      await expect(menuPage.header.cartLink).toContainText('(1)');
    });
  });

  test.describe('simulated error when adding to cart (?breakable=1)', () => {
    test.use({ appQuery: '?breakable=1' });

    test('adding a coffee logs the simulated error to the browser console', async ({ page, menuPage }) => {
      // Start listening BEFORE the click so the message cannot be missed.
      const [consoleError] = await Promise.all([
        page.waitForEvent('console', {
          predicate: (msg) => msg.type() === 'error' && msg.text().includes(messages.breakableModeError),
        }),
        menuPage.add(products.espresso.name),
      ]);

      expect(consoleError.text()).toContain(messages.breakableModeError);
    });
  });
});
