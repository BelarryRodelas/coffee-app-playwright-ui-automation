/** "Espresso Macchiato" -> "Espresso_Macchiato" (the format used in data-test attributes). */
export function toTestId(productName: string): string {
  return productName.trim().replace(/\s+/g, '_');
}

/** Matches the text on the checkout button, e.g. "Total: $18.00". */
export function totalText(amount: number): RegExp {
  const money = amount.toFixed(2).replace('.', '\\.');
  return new RegExp(`Total:\\s*\\$${money}`);
}

/** Matches text that contains at least one Chinese character. */
export const CHINESE_CHARACTERS = /[\u4e00-\u9fff]/;
