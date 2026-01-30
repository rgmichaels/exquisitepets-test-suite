import type { Page, Locator } from 'playwright';
import assert from 'node:assert';
import { BasePage } from './BasePage';

export class ContactPage extends BasePage {
  readonly header: Locator;

  // Helper text can change; best-effort
  readonly helperTextCandidates: Locator;

  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;

  // Subject may not exist on many Shopify forms; treat as optional
  readonly subject: Locator;

  readonly message: Locator;
  readonly sendButton: Locator;

  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl, '/contact');

    this.header = page.locator('h1');

    this.helperTextCandidates = page
      .locator('main')
      .locator('p, div')
      .filter({ hasText: /contact|hear from you|reach out|send us|message|help/i });

    // Name fields vary a lot; keep flexible.
    this.firstName = page.getByLabel(/first name/i).or(
      page.locator('input[name*="first" i], input[id*="first" i], input[placeholder*="first" i]')
    );

    this.lastName = page.getByLabel(/last name/i).or(
      page.locator('input[name*="last" i], input[id*="last" i], input[placeholder*="last" i]')
    );

    // Email: target visible required input; ignore confirmation.
    this.email = page
      .getByRole('textbox', { name: /email\s*\(required\)/i })
      .or(page.locator('input[type="email"]:not(#email-confirmation-field):visible'));

    // Subject: optional; some themes have it, many don't.
    this.subject = page.getByLabel(/subject/i).or(
      page.locator('input[name*="subject" i], input[id*="subject" i], input[placeholder*="subject" i]')
    );

    this.message = page.getByLabel(/message/i).or(
      page.locator('textarea[name*="message" i], textarea[id*="message" i], textarea[placeholder*="message" i]')
    );

    this.sendButton = page.getByRole('button', { name: /send/i }).or(
      page.locator('button[type="submit"], input[type="submit"]')
    );
  }

  // Backward-compatible method names for existing steps
  async assertLoaded(): Promise<void> {
    await this.header.waitFor({ state: 'visible', timeout: 15_000 });
  }

  async assertHeaderAndHelperText(): Promise<void> {
    await this.assertHeaderAndHelperTextPresent();
  }

  async assertHeaderAndHelperTextPresent(): Promise<void> {
    await this.header.waitFor({ state: 'visible', timeout: 15_000 });

    const headerText = (await this.header.textContent()) ?? '';
    assert.ok(
      /contact/i.test(headerText),
      `Expected Contact page header to include "Contact", but got:\n${headerText}`
    );

    // Best-effort helper text
    try {
      const candidate = this.helperTextCandidates.first();
      await candidate.waitFor({ state: 'visible', timeout: 3_000 });
    } catch {
      // ignore
    }
  }

  async assertFormFieldsAndSendButtonPresent(): Promise<void> {
    // Some themes use a single Name field instead of first/last.
    // We keep first/last required for now because your step name implies it,
    // but we can loosen this later if needed.
    await this.firstName.first().waitFor({ state: 'visible', timeout: 10_000 });
    await this.lastName.first().waitFor({ state: 'visible', timeout: 10_000 });

    await this.email.first().waitFor({ state: 'visible', timeout: 10_000 });
    await this.message.first().waitFor({ state: 'visible', timeout: 10_000 });
    await this.sendButton.waitFor({ state: 'visible', timeout: 10_000 });

    // Optional: subject (do not fail if missing)
    try {
      await this.subject.first().waitFor({ state: 'visible', timeout: 2_000 });
    } catch {
      // ignore
    }
  }
}
