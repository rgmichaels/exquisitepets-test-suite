import type { Page, Locator } from 'playwright';
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
   * Clicks a product card/link by its visible name and waits for navigation to settle.
   * Kept in the POM to keep step definitions thin + consistent.
   */
  async openProductByName(productName: string): Promise<void> {
    // The shop listing uses <a> cards containing the product name.
    const productLink = this.page.locator('a', { hasText: productName }).first();

    await productLink.waitFor({ state: 'visible', timeout: 15_000 });
    await productLink.click();

    // Shopify themes vary; domcontentloaded is a good "done enough" point.
    await this.page.waitForLoadState('domcontentloaded');
  }
}
