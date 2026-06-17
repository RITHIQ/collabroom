const { buildDriver, By, until } = require('../helpers/driver');
const testData = require('../helpers/testData');
const { loginAsCreator, waitForDisplayed } = require('../helpers/auth');

describe('Dashboard Tests', () => {
  let driver;

  beforeAll(async () => {
    driver = await buildDriver();
    await loginAsCreator(driver);
  }, 90000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  beforeEach(async () => {
    await driver.get(testData.BASE_URL + '/#/dashboard');
    await driver.sleep(2000);
  });

  test('TC_DASH_001: /dashboard body visible', async () => {
    const body = await driver.wait(until.elementLocated(By.css('body')), 5000);
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_DASH_002: [class*="card"] elements present (count > 0)', async () => {
    await waitForDisplayed(driver, By.css('[data-testid="dashboard"]'));
    const cards = await driver.findElements(By.css('[class*="card"]'));
    expect(cards.length).toBeGreaterThan(0);
  });

  test('TC_DASH_003: [data-testid="sidebar"] visible', async () => {
    const sidebar = await waitForDisplayed(driver, By.css('[data-testid="sidebar"]'));
    expect(await sidebar.isDisplayed()).toBe(true);
  });

  test('TC_DASH_004: h1 or h2 visible', async () => {
    const h1s = await driver.findElements(By.css('h1'));
    const h2s = await driver.findElements(By.css('h2'));
    expect(h1s.length + h2s.length).toBeGreaterThan(0);
  });

  test('TC_DASH_005: [data-testid="wallet-balance"] visible', async () => {
    const walletBalance = await waitForDisplayed(driver, By.css('[data-testid="wallet-balance"]'));
    expect(await walletBalance.isDisplayed()).toBe(true);
  });
});
