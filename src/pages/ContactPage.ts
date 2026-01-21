import type { Page } from 'playwright';
import { BasePage } from './BasePage';

export class ContactPage extends BasePage {
  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl, '/contact');
  }
}
