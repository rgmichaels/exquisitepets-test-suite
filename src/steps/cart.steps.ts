import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import { CustomWorld } from '../support/world';

function normalizeUrl(url: string): string {
  // Strip trailing slash for stable comparisons.
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

When(
  'I open the product {string} from the home page',
  async function (this: CustomWorld, productName: string) {
    if (!this.page) throw new Error('Playwright page is not initialized on world.');

    // The home/shop listing uses <a> cards containing the product name.
    const productLink = this.page.locator('a', { hasText: productName }).first();

    await productLink.waitFor({ state: 'visible', timeout: 15_000 });
    await productLink.click();

    await this.page.waitForLoadState('domcontentloaded');
  }
);

Then(
  'I should be on the product page {string}',
  async function (this: CustomWorld, expectedUrl: string) {
    if (!this.page) throw new Error('Playwright page is not initialized on world.');

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
);

When('I add the product to the cart', async function (this: CustomWorld) {
  if (!this.page) throw new Error('Playwright page is not initialized on world.');

  const addToCart = this.page.getByRole('button', { name: /add to cart/i });

  await addToCart.waitFor({ state: 'visible', timeout: 15_000 });
  await addToCart.click();

  // Let async cart update finish (drawer/cart api/etc.)
  await this.page.waitForTimeout(750);
});

When('I open the cart page', async function (this: CustomWorld) {
  if (!this.page) throw new Error('Playwright page is not initialized on world.');

  const cartUrl = new URL('/cart', this.baseUrl).toString();
  this.lastResponse = await this.page.goto(cartUrl, { waitUntil: 'domcontentloaded' });
});

Then(
  'the cart should contain the product {string}',
  async function (this: CustomWorld, productName: string) {
    if (!this.page) throw new Error('Playwright page is not initialized on world.');

    const lineItem = this.page.getByText(productName, { exact: false });

    await lineItem.waitFor({ state: 'visible', timeout: 15_000 });

    const visible = await lineItem.isVisible();
    assert.ok(visible, `Expected cart to contain product: "${productName}"`);
  }
);

When(
  'I remove the product {string} from the cart',
  async function (this: CustomWorld, productName: string) {
    if (!this.page) throw new Error('Playwright page is not initialized on world.');

    const itemText = this.page.getByText(productName, { exact: false }).first();
    await itemText.waitFor({ state: 'visible', timeout: 15_000 });

    // Try within the nearest reasonable container.
    const container = itemText.locator('xpath=ancestor::*[self::li or self::tr or self::div][1]');

    // Different themes label removal differently: Remove, aria-label, or "×".
    const removeCandidates = [
      container.getByRole('button', { name: /remove/i }),
      container.getByRole('link', { name: /remove/i }),
      container.locator('button:has-text("×")'),
      container.locator('button:has-text("X")'),
      container.locator('a:has-text("×")'),
      container.locator('a:has-text("X")'),
      container.locator('[aria-label*="remove" i]'),
      container.locator('[title*="remove" i]'),
    ];

    let clicked = false;
    for (const candidate of removeCandidates) {
      try {
        if (await candidate.first().isVisible({ timeout: 1000 })) {
          await candidate.first().click();
          clicked = true;
          break;
        }
      } catch {
        // try next
      }
    }

    assert.ok(
      clicked,
      'Could not find a remove (X) control for the cart line item. ' +
        'If the theme uses a different selector/label, we can tune this locator.'
    );

    await this.page.waitForTimeout(750);
  }
);

Then(
  'the cart should not contain the product {string}',
  async function (this: CustomWorld, productName: string) {
    if (!this.page) throw new Error('Playwright page is not initialized on world.');

    // Scope to the main cart content to avoid matching "You may also like" etc.
    const main = this.page.locator('main');

    // Try to identify the *line item container* rather than just the raw text node.
    const itemContainer = main
      .locator('li, tr, [role="row"], div')
      .filter({ hasText: productName });

    // Poll for up to 15s until the item container is gone or not visible.
    const timeoutMs = 15_000;
    const pollMs = 250;
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      const count = await itemContainer.count();

      if (count === 0) return;

      // If it still exists, check if all matches are hidden
      let anyVisible = false;
      for (let i = 0; i < Math.min(count, 5); i++) {
        const vis = await itemContainer.nth(i).isVisible().catch(() => false);
        if (vis) {
          anyVisible = true;
          break;
        }
      }

      if (!anyVisible) return;

      await this.page.waitForTimeout(pollMs);
    }

    throw new Error(`Expected product to be removed from cart: "${productName}"`);
  }
);

Given(
  'the shopping cart is empty',
  async function (this: CustomWorld) {
    if (!this.page) throw new Error('Playwright page is not initialized on world.');

    const cartUrl = new URL('/cart', this.baseUrl).toString();
    await this.page.goto(cartUrl, { waitUntil: 'domcontentloaded' });

    const emptyCartText = 'You have nothing in your shopping cart.';

    // Locator for the empty-cart message
    const emptyMessage = this.page.getByText(emptyCartText, { exact: false });

    // Give the page a moment to settle (cart APIs, hydration, etc.)
    await this.page.waitForTimeout(500);

    if (await emptyMessage.isVisible().catch(() => false)) {
      // Happy path: cart is clean
      return;
    }

    // If the empty message is NOT visible, check if items exist
    const cartItems = this.page.locator(
      'li, tr, [role="row"], [data-cart-item]'
    );

    const itemCount = await cartItems.count();

    assert.fail(
      [
        'Precondition failed: expected empty shopping cart.',
        `Expected message: "${emptyCartText}"`,
        itemCount > 0
          ? `Found ${itemCount} item(s) already in the cart.`
          : 'Empty-cart message not found, but no cart items were clearly detectable.',
        'This test requires a clean cart to run deterministically.',
      ].join('\n')
    );
  }
);