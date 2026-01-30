import type { Page, Locator } from 'playwright';
import assert from 'node:assert';
import { BasePage } from './BasePage';

export class HomeShopPage extends BasePage {
  private footer: Locator;

  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl, '/');
    this.footer = page.locator('footer');
  }

  async getFooterText(): Promise<string> {
    return (await this.footer.innerText()).trim();
  }

  /**
   * Used by cart tests: opens a product by clicking its card/link on the HomeShop page.
   */
  async openProductByName(productName: string): Promise<void> {
    const productLink = this.page.locator('a', { hasText: productName }).first();

    await productLink.waitFor({ state: 'visible', timeout: 15_000 });
    await productLink.scrollIntoViewIfNeeded();

    await productLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Validates the product image is present, has non-empty alt text,
   * and has actually loaded (naturalWidth > 0).
   *
   * Shopify themes often lazy-load images, so we scroll into view
   * and then wait for actual load.
   */
  async assertProductImageLoads(productName: string): Promise<void> {
    const productCard = this.page.locator('a', { hasText: productName }).first();
    await productCard.waitFor({ state: 'visible', timeout: 15_000 });

    // Trigger lazy-load by bringing card into viewport
    await productCard.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(250);

    const img = productCard.locator('img').first();
    await img.waitFor({ state: 'visible', timeout: 15_000 });

    const alt = (await img.getAttribute('alt')) ?? '';
    assert.ok(
      alt.trim().length > 0,
      `Product image is missing alt text for product:\n"${productName}"`
    );

    const handle = await img.elementHandle();
    assert.ok(handle, `Could not get image element handle for product:\n"${productName}"`);

    // Wait up to 10s for a *real* loaded image
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

    assert.ok(
      loaded,
      `Product image did not load (likely lazy-loaded or broken) for product:\n"${productName}"`
    );
  }
}
