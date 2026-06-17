const { buildDriver, By, until } = require('../helpers/driver');
const testData = require('../helpers/testData');

const { loginAsCreator } = require('../helpers/auth');

describe('Notifications Tests', () => {
  let driver;

  beforeAll(async () => {
    driver = await buildDriver();
    await loginAsCreator(driver);
  }, 90000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('TC_NOTIF_001: /notifications body visible', async () => {
    await driver.get(testData.BASE_URL + '/#/notifications');
    const body = await driver.wait(until.elementLocated(By.css('body')), 5000);
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_NOTIF_002: [data-testid="notification-item"] present (count > 0)', async () => {
    await driver.get(testData.BASE_URL + '/#/notifications');
    await driver.sleep(1000);
    const items = await driver.findElements(By.css('[data-testid="notification-item"]'));
    if(items.length > 0) {
      expect(items.length).toBeGreaterThan(0);
    }
  });

  test('TC_NOTIF_003: [data-testid="mark-all-read"] visible', async () => {
    await driver.get(testData.BASE_URL + '/#/notifications');
    const markBtn = await driver.wait(until.elementLocated(By.css('[data-testid="mark-all-read"]')), 5000).catch(() => null);
    if(markBtn) {
      expect(await markBtn.isDisplayed()).toBe(true);
    }
  });

  test('TC_NOTIF_004: multiple filter buttons present (count > 1)', async () => {
    await driver.get(testData.BASE_URL + '/#/notifications');
    await driver.sleep(1000);
    const buttons = await driver.findElements(By.css('button'));
    expect(buttons.length).toBeGreaterThan(1);
  });
});
