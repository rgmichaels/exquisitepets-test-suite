import type { Page, Locator } from 'playwright';
import assert from 'node:assert/strict';
import { BasePage } from './BasePage';

export class AboutPage extends BasePage {
  // Form fields (currently not present on /about, kept for future-proofing)
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly signupRadio: Locator;
  readonly message: Locator;
  readonly submitButton: Locator;

  // About page content
  readonly whoWeAreText: Locator;
  readonly missionText: Locator;

  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl, '/about');

    // Form locators (intentionally broad but stable)
    this.firstName = page.locator('input[name*="first" i]');
    this.lastName = page.locator('input[name*="last" i]');
    this.email = page.locator('input[type="email"], input[name*="email" i]');
    this.signupRadio = page.locator('input[type="radio"]');
    this.message = page.locator('textarea');
    this.submitButton = page.locator(
      'button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("Send")'
    );

    // About content locators (smoke-safe, resilient to copy tweaks)
    this.whoWeAreText = page.locator('text=/Who we are/i');
    this.missionText = page.locator(
      'text=/Exquisite Pets, our mission is to enhance the bond between you and your dog/i'
    );
  }

  /**
   * WIP / future-facing:
   * Asserts presence of form fields if/when they are added to /about.
   */
  async assertRequiredFormFieldsPresent(): Promise<void> {
    assert(await this.firstName.isVisible(), 'About page missing: First name field');
    assert(await this.lastName.isVisible(), 'About page missing: Last name field');
    assert(await this.email.isVisible(), 'About page missing: Email field');

    // Radios are often visually hidden; existence is sufficient
    assert(
      (await this.signupRadio.count()) > 0,
      'About page missing: Sign up radio button'
    );

    assert(await this.message.isVisible(), 'About page missing: Message field');
    assert(await this.submitButton.isVisible(), 'About page missing: Submit button');
  }

  /**
   * Smoke assertion:
   * Proves the About page is rendered and contains core brand messaging.
   */
  async assertAboutUsContentPresent(): Promise<void> {
    assert(
      await this.whoWeAreText.isVisible(),
      'About page missing expected heading text: "Who we are"'
    );

    assert(
      await this.missionText.isVisible(),
      'About page missing expected mission statement text'
    );
  }
}
