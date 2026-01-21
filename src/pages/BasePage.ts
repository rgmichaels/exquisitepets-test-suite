import type { Page, Response } from 'playwright';

export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;
  protected path: string;

  constructor(page: Page, baseUrl: string, path: string) {
    this.page = page;
    this.baseUrl = baseUrl;
    this.path = path;
  }

  protected buildUrl(): string {
    // Robust URL join using WHATWG URL API.
    return new URL(this.path, this.baseUrl).toString();
  }

  async goto(): Promise<Response | null> {
    const url = this.buildUrl();
    return this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }
}
