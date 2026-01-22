import { Page, Locator } from 'playwright';
import { expect } from 'playwright/test';
import { BasePage } from './BasePage';

export class ContactPage extends BasePage {
  readonly header: Locator;
  readonly helperText: Locator;

  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly messageInputOrTextarea: Locator;
  readonly sendButton: Locator;

  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl, '/contact');

    // Don't assume it's an <h1>/<h2> etc. Some sites style a <div> as a "header".
    // Prefer a real heading if present, otherwise fall back to visible text.
    const headingCandidate = page.getByRole('heading', { name: /contact us/i });
    const textCandidate = page.getByText(/contact us/i);
    this.header = headingCandidate.or(textCandidate);

    // Be tolerant of curly vs straight apostrophe in "you're / you’re"
    this.helperText = page.getByText(
      /If you[’']re interested in collaborating, please provide your information, and we will contact you soon\. We look forward to connecting with you\./
    );

    this.firstNameInput = page
      .getByLabel(/first name/i)
      .or(page.locator('input[placeholder*="First" i], input[name*="first" i], input[id*="first" i]'));

    this.lastNameInput = page
      .getByLabel(/last name/i)
      .or(page.locator('input[placeholder*="Last" i], input[name*="last" i], input[id*="last" i]'));

    this.emailInput = page
      .getByLabel(/^email$/i)
      .or(
        page.locator(
          'input[type="email"], input[placeholder*="email" i], input[name*="email" i], input[id*="email" i]'
        )
      );

    this.messageInputOrTextarea = page
      .getByLabel(/message/i)
      .or(
        page.locator(
          'textarea[placeholder*="message" i], textarea[name*="message" i], textarea[id*="message" i], input[placeholder*="message" i]'
        )
      );

    this.sendButton = page.getByRole('button', { name: /^send$/i });
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL(/\/contact\/?$/, { timeout: 20_000 });

    // "Loaded" means the page contains the key visible identifier, not necessarily a semantic heading.
    await expect(this.page.getByText(/contact us/i)).toBeVisible({ timeout: 20_000 });
  }

  async assertHeaderAndHelperText() {
    await expect(this.header).toBeVisible({ timeout: 20_000 });
    await expect(this.helperText).toBeVisible({ timeout: 20_000 });
  }

  async assertFormFieldsAndSendButtonPresent() {
    await expect(this.firstNameInput).toBeVisible({ timeout: 20_000 });
    await expect(this.lastNameInput).toBeVisible({ timeout: 20_000 });
    await expect(this.emailInput).toBeVisible({ timeout: 20_000 });
    await expect(this.messageInputOrTextarea).toBeVisible({ timeout: 20_000 });
    await expect(this.sendButton).toBeVisible({ timeout: 20_000 });
  }
}
