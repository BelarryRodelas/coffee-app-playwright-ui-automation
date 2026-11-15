import { randomUUID } from 'node:crypto';
import customersJson from '../../test-data/customers.json';
import messagesJson from '../../test-data/messages.json';
import productsJson from '../../test-data/products.json';
import promoJson from '../../test-data/promo.json';
import translationsJson from '../../test-data/translations.json';
import type { Customer, Product, PromoOffer, Translation } from './types';

/** Product catalogue used by the tests. Edit test-data/products.json, not the tests. */
export const products: Record<keyof typeof productsJson, Product> = productsJson;

/** The "lucky day" offer: an extra discounted item. */
export const promo: PromoOffer = promoJson;

/** Messages the app writes to the browser console in its test modes (observed on the live app). */
export const messages: typeof messagesJson = messagesJson;

/** Expected Chinese titles after a double-click (observed on the live app). */
export const translations: Translation[] = translationsJson;

/**
 * Builds a customer from the JSON template with a unique email address,
 * so tests never depend on each other's data.
 */
export function buildCustomer(overrides: Partial<Customer> = {}): Customer {
  const base = customersJson.validCustomer;
  const [local, domain] = base.email.split('@');
  const unique = randomUUID().slice(0, 8);
  return { ...base, email: `${local}+${unique}@${domain}`, ...overrides };
}