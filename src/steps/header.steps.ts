import { Then, DataTable } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import type { CustomWorld } from '../support/world';

type SocialRow = { platform: string; url: string };
type NavRow = { label: string; url: string };

function canonicalizeUrl(raw: string): string {
  const url = new URL(raw.trim());
  url.hash = '';

  const dropParams = new Set([
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'fbclid',
    'mibextid',
    'rdid',
    'share_url',
    'igsh',
  ]);

  [...url.searchParams.keys()].forEach((k) => {
    if (dropParams.has(k)) url.searchParams.delete(k);
  });

  if (url.hostname.includes('instagram.com')) {
    url.pathname = url.pathname.replace(/\/+$/, '');
  }

  return url.toString();
}

function canonicalizeInternalUrl(raw: string): string {
  const url = new URL(raw.trim());
  url.hash = '';

  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
  }

  return url.toString();
}

Then(
  'the header should show social media links',
  async function (this: CustomWorld, table: DataTable) {
    assert(this.page, 'World.page is undefined. Did the Before hook create a Playwright page?');

    const rows = table.hashes() as SocialRow[];

    const header = this.page.locator('header');
    const headerCount = await header.count();
    assert.equal(headerCount, 1, `Expected exactly 1 <header>, found ${headerCount}`);

    for (const { platform, url } of rows) {
      const nameRe = new RegExp(`^${platform}$`, 'i');
      const link = header.getByRole('link', { name: nameRe });

      const linkCount = await link.count();
      assert(linkCount > 0, `Expected a header link with accessible name "${platform}", found none`);

      await link.first().waitFor({ state: 'visible' });

      const href = await link.first().getAttribute('href');
      assert(href, `Expected "${platform}" link to have an href`);

      const actualAbs = new URL(href, this.page.url()).toString();
      const expectedCanon = canonicalizeUrl(url);
      const actualCanon = canonicalizeUrl(actualAbs);

      assert.equal(
        actualCanon,
        expectedCanon,
        `Expected "${platform}" to link to:\n  ${expectedCanon}\nbut found:\n  ${actualCanon}\n(raw href="${href}")`
      );
    }
  }
);

Then(
  'the header should show navigation links',
  async function (this: CustomWorld, table: DataTable) {
    assert(this.page, 'World.page is undefined. Did the Before hook create a Playwright page?');

    const rows = table.hashes() as NavRow[];

    const header = this.page.locator('header');
    const headerCount = await header.count();
    assert.equal(headerCount, 1, `Expected exactly 1 <header>, found ${headerCount}`);

    for (const { label, url } of rows) {
      const nameRe = new RegExp(label, 'i');
      const link = header.getByRole('link', { name: nameRe });

      const linkCount = await link.count();
      assert(linkCount > 0, `Expected a header link with accessible name matching "${label}", found none`);

      await link.first().waitFor({ state: 'visible' });

      const href = await link.first().getAttribute('href');
      assert(href, `Expected "${label}" link to have an href`);

      const expectedAbs = new URL(url, this.page.url()).toString();
      const actualAbs = new URL(href, this.page.url()).toString();

      const expectedCanon = canonicalizeInternalUrl(expectedAbs);
      const actualCanon = canonicalizeInternalUrl(actualAbs);

      assert.equal(
        actualCanon,
        expectedCanon,
        `Expected "${label}" to link to:\n  ${expectedCanon}\nbut found:\n  ${actualCanon}\n(raw href="${href}")`
      );
    }
  }
);
