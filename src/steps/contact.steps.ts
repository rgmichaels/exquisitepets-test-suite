import { Given, Then } from '@cucumber/cucumber';
import { expect } from 'playwright/test';
import { ContactPage } from '../pages/ContactPage';

function joinUrl(baseUrl: string, path: string) {
  const base = baseUrl.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

Given('I open the Contact page', async function () {
  const contact = new ContactPage(this.page, this.baseUrl);

  // Go to home first (often bypasses 403 rules that block direct deep links)
  await this.page.goto(this.baseUrl.replace(/\/+$/, ''), { waitUntil: 'domcontentloaded' });

  // Try clicking a Contact link in the UI (most realistic)
  const contactLink = this.page
    .getByRole('link', { name: /^contact$/i })
    .or(this.page.getByRole('link', { name: /contact us/i }))
    .or(this.page.locator('a[href*="contact" i]').first());

  await expect(contactLink).toBeVisible({ timeout: 20_000 });
  await contactLink.click();

  // Wait for navigation to settle on a URL containing "contact"
  await expect(this.page).toHaveURL(/contact/i, { timeout: 20_000 });

  await contact.assertLoaded();
});

Then('the Contact page should display header and helper text', async function () {
  const contact = new ContactPage(this.page, this.baseUrl);
  await contact.assertHeaderAndHelperText();
});

Then('the Contact page should show the contact form fields and SEND button', async function () {
  const contact = new ContactPage(this.page, this.baseUrl);
  await contact.assertFormFieldsAndSendButtonPresent();
});
