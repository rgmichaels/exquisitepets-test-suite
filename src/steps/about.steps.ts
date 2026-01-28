import { Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { AboutPage } from '../pages/AboutPage';

type ElemDump = {
  tag: string;
  type?: string;
  name?: string;
  id?: string;
  placeholder?: string;
  ariaLabel?: string | null;
  text?: string;
};

async function dumpFormElementsFromFrame(
  frame: import('playwright').Frame,
  label: string
): Promise<void> {
  const items: ElemDump[] = await frame.evaluate(() => {
    const els = Array.from(document.querySelectorAll('input, textarea, button')) as Array<
      HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement
    >;

    return els.map((e) => ({
      tag: e.tagName.toLowerCase(),
      type: (e as HTMLInputElement).type,
      name: (e as HTMLInputElement).name,
      id: (e as HTMLElement).id,
      placeholder: (e as HTMLInputElement).placeholder,
      ariaLabel: e.getAttribute?.('aria-label') ?? null,
      text: (e as HTMLElement).textContent?.trim(),
    }));
  });

  // eslint-disable-next-line no-console
  console.log(`${label} FORM ELEMENTS FOUND (${items.length}):`, JSON.stringify(items, null, 2));
}

/**
 * NOTE:
 * You already proved /about has no form fields. Keep this step @wip or remove it later.
 * Leaving it here (debug-friendly) but keeping assertions delegated to the POM.
 */
Then('the About page should show the required form fields', async function () {
  const baseUrl = this.baseUrl ?? process.env.BASE_URL;
  assert(baseUrl, 'BASE_URL is not set (expected this.baseUrl or process.env.BASE_URL)');

  const aboutPage = new AboutPage(this.page, baseUrl);

  await this.page.waitForLoadState('domcontentloaded');

  // eslint-disable-next-line no-console
  console.log('DEBUG URL:', this.page.url());
  // eslint-disable-next-line no-console
  console.log('DEBUG TITLE:', await this.page.title());

  const frames = this.page.frames();
  // eslint-disable-next-line no-console
  console.log('DEBUG FRAMES COUNT:', frames.length);

  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    await dumpFormElementsFromFrame(f, `FRAME[${i}] ${f.url()}`);
  }

  // Delegate assertions to the POM (keeps step clean)
  await aboutPage.assertRequiredFormFieldsPresent();
});

/**
 * NEW: About page content smoke assertion (delegated to POM)
 */
Then('the About page should display the About Us content', async function () {
  const baseUrl = this.baseUrl ?? process.env.BASE_URL;
  assert(baseUrl, 'BASE_URL is not set (expected this.baseUrl or process.env.BASE_URL)');

  const aboutPage = new AboutPage(this.page, baseUrl);

  await this.page.waitForLoadState('domcontentloaded');

  await aboutPage.assertAboutUsContentPresent();
});
