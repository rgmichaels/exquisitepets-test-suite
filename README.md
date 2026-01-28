# ExquisitePets Test Suite

Playwright + Cucumber + TypeScript smoke tests for https://www.exquisitepets.shop/.

## Prerequisites

- Node.js (LTS recommended)
- npm
- A network connection to reach https://www.exquisitepets.shop/

## Install

```bash
npm install
npx playwright install
```

## Run tests

```bash
npm test
```

By default:

- `BASE_URL` defaults to `https://www.exquisitepets.shop/`
- `HEADLESS` defaults to `true`

You can override:

```bash
# Run headed
HEADLESS=false npm test

# Override base URL
BASE_URL="https://www.exquisitepets.shop/" npm test
```

## Screenshots on failure

On scenario failure, the `After` hook will:

- Take a full-page screenshot
- Save it under `artifacts/screenshots/`
- Attach the file path to the Cucumber report/console output

## Project structure

- `features/*.feature` — Gherkin feature files
- `src/pages/*.ts` — Page Objects (one per page)
- `src/steps/common.steps.ts` — shared step definitions
- `src/steps/*.steps.ts` — page-specific step definitions
- `src/support/world.ts` — typed CustomWorld (browser, context, page, lastResponse, baseUrl)
- `src/support/hooks.ts` — Cucumber hooks (launch/teardown, screenshots)
- `artifacts/` — reports and screenshots
```

## Handy npm scripts
    npm test -- --tags "@about and not @wip"

## AI Prompts to assist test development
- Generate Gherkin scenarios:
NEW TEST CASE
Instructions: 
    Use today's source code and/or files we've worked on since then
    Modify the Page Object, Steps, and feature files as needed and provide full code for each.
Page: /about
    Intent: 
        “Prove the presence of the text on the About Us page.”"
    Signals to assert (ranked):
        'Who we are'
        'Exquisite Pets, our mission is to enhance the bond between you and your dog by offering premium, all-natural treats you both can trust! Sourced ethically from grass-fed, free-range farms in Brazil, our products reflect a commitment to simple, wholesome nutrition—because we believe that happy, healthy pets start with clean, transparent ingredients. Each treat is thoughtfully crafted with care, integrity, and an unwavering dedication to your dog’s well-being. We sincerely appreciate your continued support.'
    Tag: @smoke @about