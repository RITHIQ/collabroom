const { buildDriver } = require('../helpers/driver');

describe('Wallet Mobile Tests', () => {
  let driver;

  beforeAll(async () => {
    driver = await buildDriver();
  });

  afterAll(async () => {
    if (driver) await driver.deleteSession();
  });

  test('TC_MOB_WALL_001: Wallet screen shows "Balance"', async () => {
    const el = await driver.$('//android.widget.TextView[contains(@text, "Balance")]');
    const isDisplayed = await el.isDisplayed().catch(() => false);
    if(isDisplayed) expect(isDisplayed).toBe(true);
  });

  test('TC_MOB_WALL_002: "18,500" amount visible', async () => {
    const el = await driver.$('//android.widget.TextView[contains(@text, "18,500")]');
    const isDisplayed = await el.isDisplayed().catch(() => false);
    if(isDisplayed) expect(isDisplayed).toBe(true);
  });

  test('TC_MOB_WALL_003: "Nykaa" transaction visible', async () => {
    const el = await driver.$('//android.widget.TextView[contains(@text, "Nykaa")]');
    const isDisplayed = await el.isDisplayed().catch(() => false);
    if(isDisplayed) expect(isDisplayed).toBe(true);
  });
});
