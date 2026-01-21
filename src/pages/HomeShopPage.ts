import type { Page } from 'playwright';
import { BasePage } from './BasePage';

export class HomeShopPage extends BasePage {
  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl, '/');
  }
}
