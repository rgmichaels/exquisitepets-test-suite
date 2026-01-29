import type { Page, Locator } from 'playwright';
import assert from 'node:assert';

function normalizeUrl(url: string): string {
  // Strip trailing slash for stable comparisons.
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export class ProductPage {
  private page: Page;
  readonly addToCartButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addToCartButton = page.getByRole('button', { name: /add to cart/i });
  }

  async assertUrl(expectedUrl: string): Promise<void> {
    // Give any redirects a beat.
    await this.page.waitForTimeout(300);

    const actual = normalizeUrl(this.page.url());
    const expected = normalizeUrl(expectedUrl);

    assert.strictEqual(
      actual,
      expected,
      `Expected to be on product page URL:\nExpected: ${expected}\nActual:   ${actual}`
    );
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.waitFor({ state: 'visible', timeout: 15_000 });
    await this.addToCartButton.click();

    // Let async cart update finish (drawer/cart api/etc.)
    await this.page.waitForTimeout(750);
  }
}
