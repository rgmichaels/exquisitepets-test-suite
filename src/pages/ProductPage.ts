import type { Page, Locator } from 'playwright';
import assert from 'node:assert';

function normalizeUrl(url: string): string {
  // Strip trailing slash for stable comparisons.
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export class ProductPage {
  private page: Page;
  readonly addToCartButton: Locator;
  readonly productTitle: Locator;
  // Try Squarespace gallery containers first, fall back to main/article content img
  readonly productImage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addToCartButton = page.getByRole('button', { name: /add to cart/i });
    this.productTitle = page.locator('h1').first();
    this.productImage = page
      .locator(
        '.ProductItem-gallery img, [data-content-field="product-images"] img, main img, article img'
      )
      .first();
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

  async assertTitleVisible(): Promise<void> {
    await this.productTitle.waitFor({ state: 'visible', timeout: 15_000 });
    const text = (await this.productTitle.textContent() ?? '').trim();
    assert.ok(text.length > 0, 'Expected product page h1 title to be non-empty');
  }

  async assertPriceVisible(expectedPrice: string): Promise<void> {
    const priceLocator = this.page.getByText(expectedPrice, { exact: false }).first();
    await priceLocator.waitFor({ state: 'visible', timeout: 15_000 });
    const visible = await priceLocator.isVisible();
    assert.ok(
      visible,
      `Expected price "${expectedPrice}" to be visible on product page.\nCurrent URL: ${this.page.url()}`
    );
  }

  async assertMainImageLoads(): Promise<void> {
    await this.productImage.waitFor({ state: 'visible', timeout: 15_000 });
    await this.productImage.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(250);

    const handle = await this.productImage.elementHandle();
    assert.ok(handle, 'Could not get product detail page image element handle');

    const loaded = await this.page
      .waitForFunction(
        (el: Element) => {
          const i = el as HTMLImageElement;

          const hasUrl =
            (i.currentSrc && i.currentSrc.length > 0) ||
            (i.src && i.src.length > 0) ||
            ((i.getAttribute('srcset') ?? '').length > 0) ||
            ((i.getAttribute('data-src') ?? '').length > 0) ||
            ((i.getAttribute('data-srcset') ?? '').length > 0);

          const isLoaded =
            i.complete && typeof i.naturalWidth === 'number' && i.naturalWidth > 0;

          return Boolean(hasUrl && isLoaded);
        },
        handle,
        { timeout: 10_000 }
      )
      .then(
        () => true,
        () => false
      );

    assert.ok(loaded, `Product detail page main image did not load.\nCurrent URL: ${this.page.url()}`);
  }

  async assertAddToCartButtonVisible(): Promise<void> {
    await this.addToCartButton.waitFor({ state: 'visible', timeout: 15_000 });
    const visible = await this.addToCartButton.isVisible();
    assert.ok(
      visible,
      `Expected "Add to Cart" button to be visible on product page.\nCurrent URL: ${this.page.url()}`
    );
  }
}
