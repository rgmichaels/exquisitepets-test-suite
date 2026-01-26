import { Then } from '@cucumber/cucumber';
import type { DataTable } from '@cucumber/cucumber';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { CustomWorld } from '../support/world';
import { HomeShopPage } from '../pages/HomeShopPage';

Then(
  'the header and paragraph text should be visible',
  async function (this: CustomWorld, table: DataTable) {
    if (!this.page) {
      throw new Error('Playwright page is not initialized on world.');
    }

    const data = table.rowsHash();
    const headerText = data['headerText'];
    const paragraphText = data['paragraphText'];

    if (!headerText || !paragraphText) {
      throw new Error(
        'Expected data table with keys "headerText" and "paragraphText".'
      );
    }

    const homePage = new HomeShopPage(this.page, this.baseUrl);
    await homePage.goto();

    const headerLocator = this.page.getByText(headerText, { exact: false });
    const paragraphLocator = this.page.getByText(paragraphText, { exact: false });

    await headerLocator.waitFor({ state: 'visible', timeout: 10_000 });
    await paragraphLocator.waitFor({ state: 'visible', timeout: 10_000 });

    const headerVisible = await headerLocator.isVisible();
    const paragraphVisible = await paragraphLocator.isVisible();

    assert.ok(
      headerVisible,
      `Expected header text to be visible: "${headerText}"`
    );
    assert.ok(
      paragraphVisible,
      `Expected paragraph text to be visible: "${paragraphText}"`
    );
  }
);

Then(
  'the product data from {string} should be visible',
  async function (this: CustomWorld, fileName: string) {
    if (!this.page) {
      throw new Error('Playwright page is not initialized on world.');
    }

    const homePage = new HomeShopPage(this.page, this.baseUrl);
    await homePage.goto();

    // Resolve the data file relative to the project root
    const filePath = path.join(process.cwd(), 'data', fileName);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Data file not found at: ${filePath}`);
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    let products: Array<{ productName: string; productPrice: string }>;
    try {
      products = JSON.parse(raw);
    } catch (err) {
      throw new Error(`Failed to parse JSON from ${filePath}: ${(err as Error).message}`);
    }

    for (const product of products) {
      const { productName, productPrice } = product;

      if (!productName || !productPrice) {
        throw new Error(
          `Invalid product entry in ${fileName}. Each product must have "productName" and "productPrice".`
        );
      }

      // Find the product card <a> that contains the full product name text.
      const productCard = this.page
        .locator('a', { hasText: productName })
        .first();

      await productCard.waitFor({ state: 'visible', timeout: 10_000 });

      const cardVisible = await productCard.isVisible();
      assert.ok(
        cardVisible,
        `Expected product card with name to be visible: "${productName}"`
      );

      const cardText = (await productCard.textContent()) ?? '';

      assert.ok(
        cardText.includes(productName),
        `Expected product card text to include name "${productName}", but got:\n${cardText}`
      );

      assert.ok(
        cardText.includes(productPrice),
        `Expected product "${productName}" card text to include price "${productPrice}", but got:\n${cardText}`
      );
    }
  }
);

Then(
  'the footer should contain the email {string}',
  async function (this: CustomWorld, expectedEmail: string) {
    if (!this.page) {
      throw new Error('Playwright page is not initialized on world.');
    }

    const homePage = new HomeShopPage(this.page, this.baseUrl);
    await homePage.goto();

    const footer = this.page.locator('footer');
    await footer.waitFor({ state: 'visible', timeout: 10_000 });

    const footerText = (await footer.innerText()).trim();

    assert.ok(
      footerText.includes(expectedEmail),
      `Expected footer to include "${expectedEmail}", but got:\n${footerText}`
    );
  }
);
