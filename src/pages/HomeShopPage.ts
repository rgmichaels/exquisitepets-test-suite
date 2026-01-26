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
}
