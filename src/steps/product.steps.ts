import { Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { ProductPage } from '../pages/ProductPage';

function requirePage(world: CustomWorld) {
  if (!world.page) {
    throw new Error('Playwright page is not initialized on world.');
  }
  return world.page;
}

Then('the product page title should be visible', async function (this: CustomWorld) {
  const product = new ProductPage(requirePage(this));
  await product.assertTitleVisible();
});

Then('the product page should show the price {string}', async function (this: CustomWorld, price: string) {
  const product = new ProductPage(requirePage(this));
  await product.assertPriceVisible(price);
});

Then('the product page main image should load', async function (this: CustomWorld) {
  const product = new ProductPage(requirePage(this));
  await product.assertMainImageLoads();
});

Then('the product page should show the Add to Cart button', async function (this: CustomWorld) {
  const product = new ProductPage(requirePage(this));
  await product.assertAddToCartButtonVisible();
});
