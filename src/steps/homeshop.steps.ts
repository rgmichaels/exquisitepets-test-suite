import { Then } from '@cucumber/cucumber';
import type { DataTable } from '@cucumber/cucumber';
import assert from 'node:assert';
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
  'the product data should be visible for each product',
  async function (this: CustomWorld, table: DataTable) {
    if (!this.page) {
      throw new Error('Playwright page is not initialized on world.');
    }

    const homePage = new HomeShopPage(this.page, this.baseUrl);
    await homePage.goto();

    const rows = table.hashes();

    for (const row of rows) {
      const productName = row.productName;
      const productPrice = row.productPrice;

      if (!productName || !productPrice) {
        throw new Error(
          'Each row must have "productName" and "productPrice" columns.'
        );
      }

      // Find the actual product link/card <a> that contains the full product name text.
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

      // Double-check the name is present on the card (sanity).
      assert.ok(
        cardText.includes(productName),
        `Expected product card text to include name "${productName}", but got:\n${cardText}`
      );

      // And explicitly check that the price is part of THAT same card.
      assert.ok(
        cardText.includes(productPrice),
        `Expected product "${productName}" card text to include price "${productPrice}", but got:\n${cardText}`
      );
    }
  }
);
