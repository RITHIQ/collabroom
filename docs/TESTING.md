# Testing Guide

Automated tests live in [`collabroom-tests/`](../collabroom-tests/).

| Suite | Technology | Target | Location |
|-------|-----------|--------|----------|
| Web E2E | Selenium + Jest | Web app (localhost:3000) | `collabroom-tests/selenium/` |
| Mobile E2E | Appium + Jest | Android APK | `collabroom-tests/appium/` |
| Security | DAST runner | Web app (localhost:3000) | `collabroom-tests/dast/` |

## Demo credentials (tests)

Configured in `collabroom-tests/selenium/helpers/testData.js`:

- Creator: `collabroomoperations+creator@gmail.com` / `Project2027#`
- Brand: `collabroomoperations+brand@gmail.com` / `Project2027#`
- Base URL: `http://localhost:3000` (override with `BASE_URL` env)

## Run all tests

```bash
cd collabroom-tests
npm run test:all
```

## Web E2E (Selenium)

**Prerequisites:** Chrome installed, web app running on port 3000.

```bash
cd collabroom-tests/selenium
npm install
npm test
```

Test files: `tests/auth.test.js`, `campaigns.test.js`, `contracts.test.js`, `dashboard.test.js`, and others.

## Mobile E2E (Appium)

**Prerequisites:** Android SDK, Appium, device/emulator, APK configured.

```bash
cd collabroom-tests/appium
npm install
npm test
```

## Security (DAST)

```bash
cd collabroom-tests/dast
npm install
npm test
```

Default target: `http://localhost:3000` (set `BASE_URL` or edit `input.json`).

## Generate HTML report

After running all suites:

```bash
cd collabroom-tests
node reports/generate-reports.js
```

Output: `collabroom-tests/reports/final-report.html`

## CI

GitHub Actions workflow [`.github/workflows/selenium-login.yml`](../.github/workflows/selenium-login.yml) runs Selenium against deployed GitHub Pages (main) or localhost preview (PRs).
