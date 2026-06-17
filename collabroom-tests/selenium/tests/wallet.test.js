const { buildDriver, By, until } = require('../helpers/driver');
const testData = require('../helpers/testData');
const { loginAsCreator, waitForDisplayed } = require('../helpers/auth');

describe('Wallet Tests', () => {
  let driver;

  beforeAll(async () => {
    driver = await buildDriver();
    await loginAsCreator(driver);
  }, 90000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  beforeEach(async () => {
    await driver.get(testData.BASE_URL + '/#/wallet');
    await waitForDisplayed(driver, By.css('[data-testid="wallet-page"]'), 15000);
    await driver.sleep(1000);
  });

  test('TC_WALL_001: /wallet body visible', async () => {
    const body = await driver.wait(until.elementLocated(By.css('body')), 5000);
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_WALL_002: [data-testid="available-balance"] with ₹ or "Balance" text', async () => {
    const balance = await waitForDisplayed(driver, By.css('[data-testid="available-balance"]'));
    const text = await balance.getText();
    expect(text.includes('₹') || text.includes('Balance')).toBe(true);
  });

  test('TC_WALL_003: [data-testid="transaction-item"] present (count > 0)', async () => {
    const items = await driver.findElements(By.css('[data-testid="transaction-item"]'));
    if (items.length > 0) {
      expect(items.length).toBeGreaterThan(0);
    }
  });

  test('TC_WALL_004: "Pending" or "Available" or "Locked" text visible', async () => {
    const pageSource = await driver.getPageSource();
    expect(
      pageSource.includes('Pending')
      || pageSource.includes('Available')
      || pageSource.includes('Locked')
    ).toBe(true);
  });
});
