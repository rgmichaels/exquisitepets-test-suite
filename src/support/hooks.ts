import { Before, After, Status } from '@cucumber/cucumber';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { CustomWorld } from './world';

Before(async function (this: CustomWorld) {
  const headlessEnv = process.env.HEADLESS;
  const headless = headlessEnv === undefined ? true : headlessEnv.toLowerCase() !== 'false';

  this.browser = await chromium.launch({ headless });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

After(async function (this: CustomWorld, scenario: any) {
  const { result, pickle } = scenario;

  if (result?.status === Status.FAILED && this.page) {
    const artifactsDir = path.join(process.cwd(), 'artifacts', 'screenshots');
    fs.mkdirSync(artifactsDir, { recursive: true });

    const safeName = pickle?.name
      ? pickle.name.replace(/[^a-z0-9\-]+/gi, '_').toLowerCase()
      : 'scenario';

    const filePath = path.join(
      artifactsDir,
      `${Date.now()}_${safeName}.png`
    );

    await this.page.screenshot({ path: filePath, fullPage: true });
    await this.attach(`Screenshot saved at: ${filePath}`);
  }

  if (this.page) {
    await this.page.close();
    this.page = undefined;
  }

  if (this.context) {
    await this.context.close();
    this.context = undefined;
  }

  if (this.browser) {
    await this.browser.close();
    this.browser = undefined;
  }
});
