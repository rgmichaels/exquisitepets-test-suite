import { Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { CustomWorld } from '../support/world';
import { HomeShopPage } from '../pages/HomeShopPage';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';
import { BasePage } from '../pages/BasePage';

function resolveCurrentPage(world: CustomWorld): BasePage {
  assert.ok(world.page, 'Playwright page is not initialized on world.');

  const path = new URL(world.page.url()).pathname;

  // Shopify may serve '/' or other equivalents depending on theme/routing.
  if (path === '/' || path === '') return new HomeShopPage(world.page, world.baseUrl);
  if (path.startsWith('/about')) return new AboutPage(world.page, world.baseUrl);
  if (path.startsWith('/contact')) return new ContactPage(world.page, world.baseUrl);

  throw new Error(
    `SEO step does not know how to map the current URL to a Page Object.\nCurrent URL: ${world.page.url()}`
  );
}

Then('the page should have a non-empty title', async function (this: CustomWorld) {
  const pageObject = resolveCurrentPage(this);
  await pageObject.assertHasNonEmptyTitle();
});

Then('the page should have a meta description', async function (this: CustomWorld) {
  const pageObject = resolveCurrentPage(this);
  await pageObject.assertHasMetaDescription();
});

Then('the canonical url should match the current url', async function (this: CustomWorld) {
  const pageObject = resolveCurrentPage(this);
  await pageObject.assertCanonicalMatchesCurrentUrl();
});
