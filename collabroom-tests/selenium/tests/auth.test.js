const { buildDriver, By, until } = require('../helpers/driver');
const testData = require('../helpers/testData');
const { loginAsCreator, waitForDisplayed } = require('../helpers/auth');

describe('Auth Tests', () => {
  let driver;

  beforeAll(async () => {
    driver = await buildDriver();
  }, 90000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('TC_AUTH_001: / loads, title truthy, [data-testid="logo"] visible', async () => {
    await driver.get(testData.BASE_URL + '/#/');
    const title = await driver.getTitle();
    expect(title).toBeTruthy();

    const logo = await driver.wait(until.elementLocated(By.css('[data-testid="logo"]')), 5000);
    expect(await logo.isDisplayed()).toBe(true);
  });

  test('TC_AUTH_002: /, Creator and Brand role cards visible', async () => {
    await driver.get(testData.BASE_URL + '/#/');
    const pageSource = await driver.getPageSource();
    expect(pageSource.includes('Creator')).toBe(true);
    expect(pageSource.includes('Brand')).toBe(true);
  });

  test('TC_AUTH_003: /#/login, [data-testid="email-input"] visible', async () => {
    await driver.get(testData.BASE_URL + '/#/login');
    await driver.sleep(2000);

    const emailInput = await waitForDisplayed(driver, By.css('[data-testid="email-input"]'));
    expect(await emailInput.isDisplayed()).toBe(true);
  });

  test('TC_AUTH_004: /dashboard URL contains "dashboard"', async () => {
    await loginAsCreator(driver);
    await driver.get(testData.BASE_URL + '/#/dashboard');
    await driver.wait(until.urlContains('dashboard'), 10000);

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('dashboard');
  }, 60000);

  test('TC_AUTH_005: /dashboard unauthenticated → redirects to /auth or /', async () => {
    await driver.get(testData.BASE_URL + '/');
    await driver.sleep(500);
    await driver.executeScript(`
      localStorage.clear();
      sessionStorage.clear();
    `);
    await driver.get(testData.BASE_URL + '/');
    await driver.sleep(1000);
    await driver.get(testData.BASE_URL + '/#/dashboard');

    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url.includes('auth') || url.includes('login') || url.endsWith('/#/');
    }, 10000);

    const url = await driver.getCurrentUrl();
    expect(url.includes('auth') || url.includes('login') || url === testData.BASE_URL + '/#/').toBe(true);
  });

  test('TC_AUTH_006: /auth, [data-testid="google-signin"] visible', async () => {
    await driver.get(testData.BASE_URL + '/#/login');
    await driver.sleep(2000);

    const googleBtn = await waitForDisplayed(driver, By.css('[data-testid="google-signin"]'));
    expect(await googleBtn.isDisplayed()).toBe(true);
  });
});
