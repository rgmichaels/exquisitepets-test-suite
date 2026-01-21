import { IWorldOptions, World, setWorldConstructor } from '@cucumber/cucumber';
import type { Browser, BrowserContext, Page, Response } from 'playwright';

const DEFAULT_BASE_URL = 'https://www.exquisitepets.shop/';

export class CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  lastResponse?: Response | null;
  baseUrl: string;

  constructor(options: IWorldOptions) {
    super(options);

    const envBase = process.env.BASE_URL && process.env.BASE_URL.trim().length > 0
      ? process.env.BASE_URL
      : DEFAULT_BASE_URL;

    // new URL() will normalize if missing trailing slash etc.
    this.baseUrl = new URL(envBase).toString();
  }
}

setWorldConstructor(CustomWorld);
