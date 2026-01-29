import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { HomeShopPage } from '../pages/HomeShopPage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';

function requirePage(world: CustomWorld) {
  if (!world.page) {
    throw new Error('Playwright page is not initialized on world.');
  }
  return world.page;
}

Given('the shopping cart is empty', async function (this: CustomWorld) {
  const page = requirePage(this);

  const cart = new CartPage(page, this.baseUrl);
  await cart.goto();
  await cart.assertEmpty();
});

When('I open the product {string} from the home page', async function (this: CustomWorld, productName: string) {
  const page = requirePage(this);

  const home = new HomeShopPage(page, this.baseUrl);
  await home.openProductByName(productName);
});

Then('I should be on the product page {string}', async function (this: CustomWorld, expectedUrl: string) {
  const page = requirePage(this);

  const product = new ProductPage(page);
  await product.assertUrl(expectedUrl);
});

When('I add the product to the cart', async function (this: CustomWorld) {
  const page = requirePage(this);

  const product = new ProductPage(page);
  await product.addToCart();
});

When('I open the cart page', async function (this: CustomWorld) {
  const page = requirePage(this);

  const cart = new CartPage(page, this.baseUrl);
  await cart.goto();
});

Then('the cart should contain the product {string}', async function (this: CustomWorld, productName: string) {
  const page = requirePage(this);

  const cart = new CartPage(page, this.baseUrl);
  await cart.assertContainsProduct(productName);
});

When('I remove the product {string} from the cart', async function (this: CustomWorld, productName: string) {
  const page = requirePage(this);

  const cart = new CartPage(page, this.baseUrl);
  await cart.removeProduct(productName);
});

Then('the cart should not contain the product {string}', async function (this: CustomWorld, productName: string) {
  const page = requirePage(this);

  const cart = new CartPage(page, this.baseUrl);
  await cart.assertNotContainsProduct(productName);
});

Then('the cart should be empty', async function (this: CustomWorld) {
  const page = requirePage(this);

  const cart = new CartPage(page, this.baseUrl);
  await cart.goto();
  await cart.assertEmpty();
});
