import { Given, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import { CustomWorld } from '../support/world';
import { HomeShopPage } from '../pages/HomeShopPage';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';
import { CartPage } from '../pages/CartPage';

function resolvePage(world: CustomWorld, name: string) {
  if (!world.page) {
    throw new Error('Playwright page is not initialized on world.');
  }

  switch (name) {
    case 'HomeShop':
      return new HomeShopPage(world.page, world.baseUrl);
    case 'About':
      return new AboutPage(world.page, world.baseUrl);
    case 'Contact':
      return new ContactPage(world.page, world.baseUrl);
    case 'Cart':
      return new CartPage(world.page, world.baseUrl);
    default:
      throw new Error(`Unknown page name: "${name}".`);
  }
}

Given('I open the {string} page', async function (this: CustomWorld, pageName: string) {
  const pageObject = resolvePage(this, pageName);
  this.lastResponse = await pageObject.goto();
});

Then('the navigation response should be OK', async function (this: CustomWorld) {
  assert.ok(this.lastResponse, 'Expected navigation Response to be defined');

  const status = this.lastResponse!.status();
  const ok = this.lastResponse!.ok();

  assert.ok(
    ok,
    `Expected HTTP 2xx/3xx but got ${status}`
  );
});
