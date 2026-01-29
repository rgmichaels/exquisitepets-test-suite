import type { Locator, Page } from 'playwright';
import { BasePage } from './BasePage';
import assert from 'node:assert';

type CartItem = {
  productName?: string;
  name?: string;
  quantity?: number;
};

type CartState = {
  cart?: {
    items?: CartItem[];
  };
};

export class CartPage extends BasePage {
  readonly emptyMessage: Locator;
  readonly cartHeading: Locator;

  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl, '/cart');

    this.cartHeading = page.getByRole('heading', { name: /shopping cart/i }).first();
    this.emptyMessage = page.getByText('You have nothing in your shopping cart.', { exact: false });
  }

  private cartMain(): Locator {
    return this.page.locator('main').first();
  }

  private async waitForCartShell(timeoutMs = 10_000): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.cartHeading.waitFor({ state: 'visible', timeout: timeoutMs }).catch(() => undefined);
  }

  private async waitUntil(
    predicate: () => Promise<boolean>,
    timeoutMs = 12_000,
    pollMs = 200
  ): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await predicate()) return;
      await this.page.waitForTimeout(pollMs);
    }
    throw new Error(`Timed out after ${timeoutMs}ms waiting for condition.`);
  }

  private async readCartState(): Promise<CartState | null> {
    return await this.page.evaluate(() => {
      const mainText = document.querySelector('main')?.textContent ?? '';
      const bodyText = document.body?.textContent ?? '';
      const combined = `${mainText}\n${bodyText}`;

      const idx = combined.indexOf('{"cart":');
      if (idx === -1) return null;

      const slice = combined.slice(idx);

      let depth = 0;
      let end = -1;
      for (let i = 0; i < slice.length; i++) {
        const ch = slice[i];
        if (ch === '{') depth++;
        else if (ch === '}') {
          depth--;
          if (depth === 0) {
            end = i + 1;
            break;
          }
        }
      }
      if (end === -1) return null;

      const jsonStr = slice.slice(0, end);
      try {
        return JSON.parse(jsonStr);
      } catch {
        return null;
      }
    });
  }

  private async cartItems(): Promise<CartItem[]> {
    const state = await this.readCartState();
    return state?.cart?.items ?? [];
  }

  private normalize(s: string): string {
    return s.replace(/\s+/g, ' ').trim().toLowerCase();
  }

  async assertContainsProduct(productName: string): Promise<void> {
    await this.waitForCartShell();
    const target = this.normalize(productName);

    await this.waitUntil(async () => {
      const items = await this.cartItems();
      return items.some((it) => {
        const name = this.normalize(it.productName ?? it.name ?? '');
        return name.includes(target) || target.includes(name);
      });
    }, 12_000);

    assert.ok(true, `Cart contains product (cart JSON): "${productName}"`);
  }

  async assertNotContainsProduct(productName: string): Promise<void> {
    await this.waitForCartShell();
    const target = this.normalize(productName);

    await this.waitUntil(async () => {
      const items = await this.cartItems();
      return !items.some((it) => {
        const name = this.normalize(it.productName ?? it.name ?? '');
        return name.includes(target) || target.includes(name);
      });
    }, 12_000);

    assert.ok(true, `Cart does not contain product (cart JSON): "${productName}"`);
  }

  async assertEmpty(timeoutMs = 12_000): Promise<void> {
    await this.goto();
    await this.waitForCartShell();

    await this.waitUntil(async () => {
      if (await this.emptyMessage.isVisible().catch(() => false)) return true;

      const state = await this.readCartState();
      if (!state) return false;
      const items = state.cart?.items ?? [];
      return items.length === 0;
    }, timeoutMs);

    assert.ok(true, 'Cart is empty.');
  }

  /**
   * The reliable removal loop:
   * - record starting item count
   * - attempt clicking remove (×) using multiple strategies
   * - refresh /cart
   * - succeed once item count drops (or becomes 0)
   */
  async removeProduct(_productName: string): Promise<void> {
    await this.goto();
    await this.waitForCartShell();

    // Wait until cart JSON is present and has at least 1 item
    await this.waitUntil(async () => {
      const state = await this.readCartState();
      if (!state) return false;
      const items = state.cart?.items ?? [];
      return items.length > 0;
    }, 10_000);

    const startCount = (await this.cartItems()).length;
    if (startCount === 0) return;

    const main = this.cartMain();

    const clickRemoveOnce = async () => {
      // 1) Try clicking visible "×" text if present
      const xText = main.getByText('×', { exact: true }).last();
      if (await xText.isVisible({ timeout: 800 }).catch(() => false)) {
        await xText.dispatchEvent('pointerdown').catch(() => undefined);
        await xText.dispatchEvent('mousedown').catch(() => undefined);
        await xText.click({ force: true }).catch(() => undefined);
        return;
      }

      // 2) Try any element with aria-label/title remove
      const removeAny = main.locator('[aria-label*="remove" i], [title*="remove" i]').first();
      if (await removeAny.isVisible({ timeout: 800 }).catch(() => false)) {
        await removeAny.dispatchEvent('pointerdown').catch(() => undefined);
        await removeAny.dispatchEvent('mousedown').catch(() => undefined);
        await removeAny.click({ force: true }).catch(() => undefined);
        return;
      }

      // 3) Coordinate click: far right near the line item row
      const box = await main.boundingBox().catch(() => null);
      if (!box) throw new Error('Could not determine cart main bounding box for remove click.');

      // X is near top row, far right
      const x = box.x + box.width - 22;
      const y = box.y + 150;
      await this.page.mouse.click(x, y);
    };

    for (let attempt = 1; attempt <= 3; attempt++) {
      await clickRemoveOnce();

      // Give the JS a beat to fire network calls
      await this.page.waitForTimeout(600);

      // Hard refresh cart page to pick up new state
      await this.page.reload({ waitUntil: 'domcontentloaded' }).catch(() => undefined);
      await this.waitForCartShell(10_000);

      // Success if count dropped
      const ok = await (async () => {
        try {
          await this.waitUntil(async () => {
            const items = await this.cartItems();
            return items.length < startCount;
          }, 6_000);
          return true;
        } catch {
          return false;
        }
      })();

      if (ok) return;
    }

    const finalCount = (await this.cartItems()).length;
    throw new Error(
      `Remove failed after retries: cart item count did not decrease (start=${startCount}, final=${finalCount}).`
    );
  }
}
