import type { Page, Response } from 'playwright';
import assert from 'node:assert/strict';

type DescriptionSource =
  | 'meta[name="description"]'
  | 'meta[property="og:description"]'
  | 'meta[name="twitter:description"]';

export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;
  protected path: string;

  constructor(page: Page, baseUrl: string, path: string) {
    this.page = page;
    this.baseUrl = baseUrl;
    this.path = path;
  }

  protected buildUrl(): string {
    return new URL(this.path, this.baseUrl).toString();
  }

  async goto(): Promise<Response | null> {
    const url = this.buildUrl();
    return this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  // ----------------------------
  // SEO helpers (smoke-safe)
  // ----------------------------

  protected normalizeUrlForCompare(input: string): string {
    const url = new URL(input);
    url.hash = '';

    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }

    return url.toString();
  }

  async getTitle(): Promise<string> {
    return (await this.page.title()).trim();
  }

  private async readMetaContent(selector: string): Promise<string | null> {
    const content = await this.page.evaluate((sel) => {
      const el = document.querySelector(sel);
      const val = el?.getAttribute('content') ?? '';
      return val.trim();
    }, selector);

    return content.length > 0 ? content : null;
  }

  async getBestDescriptionSignal(): Promise<{
    source: DescriptionSource | null;
    content: string | null;
  }> {
    const candidates: Array<{ source: DescriptionSource; selector: string }> = [
      { source: 'meta[name="description"]', selector: 'meta[name="description"]' },
      { source: 'meta[property="og:description"]', selector: 'meta[property="og:description"]' },
      { source: 'meta[name="twitter:description"]', selector: 'meta[name="twitter:description"]' },
    ];

    for (const c of candidates) {
      const content = await this.readMetaContent(c.selector);
      if (content) return { source: c.source, content };
    }

    return { source: null, content: null };
  }

  async getCanonicalUrl(): Promise<string | null> {
    const href = await this.page.evaluate(() => {
      const el = document.querySelector('link[rel="canonical"]');
      return (el?.getAttribute('href') ?? '').trim();
    });

    if (!href) return null;
    return new URL(href, this.page.url()).toString();
  }

  /**
   * Debug snapshot of head tags to make failures actionable.
   */
  private async getHeadSeoDebugSnapshot(): Promise<string> {
    const snap = await this.page.evaluate(() => {
      const metas = Array.from(document.head.querySelectorAll('meta')).map((m) => {
        const name = m.getAttribute('name');
        const prop = m.getAttribute('property');
        const charset = m.getAttribute('charset');
        const httpEquiv = m.getAttribute('http-equiv');
        const content = (m.getAttribute('content') ?? '').trim();

        const key =
          (name && `name="${name}"`) ||
          (prop && `property="${prop}"`) ||
          (httpEquiv && `http-equiv="${httpEquiv}"`) ||
          (charset && `charset="${charset}"`) ||
          'meta(unknown)';

        const contentPreview =
          content.length === 0 ? '(empty)' : content.length > 90 ? `${content.slice(0, 90)}…` : content;

        return `${key} content=${contentPreview}`;
      });

      const canonical = (() => {
        const el = document.head.querySelector('link[rel="canonical"]');
        const href = (el?.getAttribute('href') ?? '').trim();
        return href || '(missing)';
      })();

      const og = Array.from(document.head.querySelectorAll('meta[property^="og:"]')).map((m) => {
        const prop = m.getAttribute('property');
        const content = (m.getAttribute('content') ?? '').trim();
        const preview = content.length === 0 ? '(empty)' : content.length > 90 ? `${content.slice(0, 90)}…` : content;
        return `${prop}=${preview}`;
      });

      const twitter = Array.from(document.head.querySelectorAll('meta[name^="twitter:"]')).map((m) => {
        const name = m.getAttribute('name');
        const content = (m.getAttribute('content') ?? '').trim();
        const preview = content.length === 0 ? '(empty)' : content.length > 90 ? `${content.slice(0, 90)}…` : content;
        return `${name}=${preview}`;
      });

      // Helpful subset: anything with "description" in name/property
      const descRelated = Array.from(document.head.querySelectorAll('meta')).filter((m) => {
        const name = (m.getAttribute('name') ?? '').toLowerCase();
        const prop = (m.getAttribute('property') ?? '').toLowerCase();
        return name.includes('description') || prop.includes('description');
      }).map((m) => {
        const name = m.getAttribute('name');
        const prop = m.getAttribute('property');
        const content = (m.getAttribute('content') ?? '').trim();
        const preview = content.length === 0 ? '(empty)' : content.length > 120 ? `${content.slice(0, 120)}…` : content;
        return `${name ? `name="${name}"` : `property="${prop}"`} content=${preview}`;
      });

      return {
        canonical,
        metas,
        og,
        twitter,
        descRelated,
      };
    });

    const lines: string[] = [];
    lines.push(`Canonical: ${snap.canonical}`);
    lines.push('');
    lines.push('Description-related meta tags found:');
    lines.push(snap.descRelated.length ? snap.descRelated.map((s) => ` - ${s}`).join('\n') : ' - (none)');
    lines.push('');
    lines.push('Open Graph tags:');
    lines.push(snap.og.length ? snap.og.map((s) => ` - ${s}`).join('\n') : ' - (none)');
    lines.push('');
    lines.push('Twitter tags:');
    lines.push(snap.twitter.length ? snap.twitter.map((s) => ` - ${s}`).join('\n') : ' - (none)');
    lines.push('');
    lines.push('All <meta> in <head> (first-pass dump):');
    lines.push(snap.metas.length ? snap.metas.map((s) => ` - ${s}`).join('\n') : ' - (none)');

    return lines.join('\n');
  }

  async assertHasNonEmptyTitle(): Promise<void> {
    const title = await this.getTitle();
    assert.ok(title.length > 0, 'Expected <title> to be non-empty, but it was blank.');
  }

  async assertHasMetaDescription(): Promise<void> {
    const best = await this.getBestDescriptionSignal();
    if (best.content) return;

    const debug = await this.getHeadSeoDebugSnapshot();

    assert.ok(
      best.content,
      [
        'Expected a non-empty page description signal, but none was found.',
        'Checked (in order):',
        ' - meta[name="description"]',
        ' - meta[property="og:description"]',
        ' - meta[name="twitter:description"]',
        `Current URL: ${this.page.url()}`,
        '',
        '--- HEAD SEO DEBUG SNAPSHOT ---',
        debug,
      ].join('\n')
    );
  }

  async assertCanonicalMatchesCurrentUrl(): Promise<void> {
    const canonical = await this.getCanonicalUrl();
    assert.ok(canonical, 'Expected link[rel="canonical"] to exist.');

    const current = this.normalizeUrlForCompare(this.page.url());
    const expected = this.normalizeUrlForCompare(canonical!);

    assert.strictEqual(
      current,
      expected,
      `Expected canonical URL to match current URL.\nCanonical: ${expected}\nCurrent:   ${current}`
    );
  }
}
