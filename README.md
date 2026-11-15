# Coffee Cart: Playwright UI Automation Framework

End-to-end UI tests for https://coffee-cart.app, written with **Playwright + TypeScript**.
The framework is designed so a team of junior engineers can add tests safely.

## What is covered

| Spec file | Scenarios |
|---|---|
| `tests/checkout.spec.ts` | Add product, handle promo pop-up, checkout, submit payment details, verify success (`@smoke`); cart total with several products; checkout after declining the promo |
| `tests/promo.spec.ts` | Promo pop-up appears on every 3rd item (3, 6, 9) and on no other; accepting adds a discounted item and the correct total; declining does not |
| `tests/special-features.spec.ts` | Double-click on a coffee title translates it to Chinese (data-driven); right-click on a coffee opens the add-to-cart dialog (confirm and cancel) |
| `tests/resilience.spec.ts` | App test modes: `?ad=1` (slow page load with ads) and `?breakable=1` (simulated error when adding to cart) |

## App behaviours the tests are built around

| Observed behaviour | How the framework handles it |
|---|---|
| Promo "lucky day" pop-up on every 3rd item | `MenuPage.addProducts()` waits for it only on 3rd, 6th, 9th adds; `PROMO_INTERVAL` constant |
| The cart slows down on purpose above 7 items | The 9-item test uses `test.slow()` (longer timeout), never a sleep |
| `?ad=1` slows page load | `appQuery` fixture option: `test.use({ appQuery: '?ad=1' })` |
| `?breakable=1` throws an error on add | `resilience.spec.ts` listens for the browser `pageerror` event |
| Cart pop-up on hovering the Total button is desktop only | Projects are desktop browsers only |
| Cart lives in memory | Navigate with in-app links (`header.goToCart()`), never `page.goto('/cart')` |

## Quick start

```bash
npm install
npx playwright install        # downloads the browsers (once)
cp .env.example .env          # on Windows: copy .env.example .env
npm test                      # run everything (headless)
npm run test:ui               # run with Playwright's interactive UI (great for debugging)
npm run report                # open the last HTML report
```

Useful commands: `npm run test:smoke`, `npm run test:chromium`, `npm run test:headed`, `npm run verify` (type check plus "no hard-coded waits" check), `npm run codegen`.

## Project structure

```
.github/workflows/playwright.yml   CI pipeline
src/
  components/    Reusable parts of the UI (Header, PromoModal, PaymentModal, AddToCartDialog)
  pages/         Page Objects (MenuPage, CartPage) built on BasePage
  fixtures/      Custom Playwright fixtures (setup / teardown / state)
  data/          Typed access to test data + data factories
  utils/         Small helpers
test-data/       JSON files: products, customers (NO test logic here)
tests/           Spec files (NO selectors here)
scripts/         Repo tooling (check-no-sleeps.mjs)
playwright.config.ts
```

## Design rules (please follow these)

1. **Selectors live only in `src/pages` and `src/components`.** Spec files never contain a locator string.
2. **Specs contain assertions; page objects contain actions.** A page object exposes locators and actions, and the test decides what to `expect`.
3. **No hard-coded waits.** Never use `waitForTimeout`, `setTimeout` or `sleep`. Playwright auto-waits for actions, and `expect(locator).toBeVisible()` retries until it passes. `npm run verify` fails the build if a sleep is added.
4. **Locator priority:** `getByTestId` (the app's `data-test` attributes) or `getByRole`/`getByText` first; CSS only when nothing better exists, with a comment explaining why.
5. **Test data lives in `test-data/*.json`.** Tests ask for data (`products.espresso`, `customer` fixture) and never type literals like prices or emails.
6. **Every test is independent.** Each test gets a fresh browser context and the app keeps the cart in memory, so tests can run in any order and in parallel.
7. **Use fixtures to get page objects:** `async ({ menuPage, cartPage, customer }) => { ... }`.
8. **Use `test.step()`** to make long flows readable in the report.

## How to add a new test

1. Need a new button or field? Add a locator (and an action method if needed) to the right page object or component.
2. Need new data? Add it to `test-data/*.json`.
3. Write the spec in `tests/`, importing `test` and `expect` from `../src/fixtures` (not from `@playwright/test`).
4. Run `npm run verify` and `npm test` before opening a pull request.

## Fixtures

| Fixture | What it does |
|---|---|
| `menuPage` | Opens the app before the test (setup) and hands over the `MenuPage` object |
| `cartPage` | The `CartPage` object. It does **not** navigate, because the cart lives in memory: use `menuPage.header.goToCart()` |
| `customer` | A customer built from `customers.json` with a unique email for this test |
| `browserDiagnostics` | Runs automatically; collects browser console errors and attaches them to the report (teardown) |

## Environments and configuration

- The target URL comes from `BASE_URL` (see `.env.example`), with `https://coffee-cart.app` as the default.
- Nothing environment-specific is hard-coded in tests.
- Sensitive values (if ever needed) belong in GitHub **Secrets**; non-sensitive ones in GitHub **Variables**.

## CI/CD (GitHub Actions)

`.github/workflows/playwright.yml` runs on every push to `main`, every pull request and on demand:

- Installs dependencies with `npm ci` (cached).
- Runs static checks (`npm run verify`): TypeScript types and the "no hard-coded waits" rule.
- Runs the tests in **parallel jobs, one per browser** (Chromium and Firefox), and parallel workers inside each job.
- Retries failed tests twice in CI and records a trace on the first retry.
- Uploads the **HTML report** and **JUnit XML** as downloadable artifacts, even when tests fail.

## Locator confidence

Seen in the app screenshots (high confidence): nav links `menu` / `cart (n)`, the `Total: $x` button, the promo text and its two buttons, the Payment details form (Name, Email, checkbox, Submit), the `No coffee, go add some.` message, and the `Add <coffee> to the cart?` dialog with Yes / No.

Not visible in screenshots, so check these first if a test fails: the `data-test` names for cups and the Total button (`checkout`), the `#name` / `#email` / `#promotion` ids, the success text `Thanks for your purchase`, and the cart rows being `listitem`s.

## Troubleshooting a failing locator

The site's HTML can change. If a test fails because an element can't be found:

1. Run `npm run test:ui`, open the failing test and use the locator picker, or run `npm run codegen` and click the element.
2. Update the locator in the **page object or component only**.
3. Prefer `getByTestId` / `getByRole` over CSS.
