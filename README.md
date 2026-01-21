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
