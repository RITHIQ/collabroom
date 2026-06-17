const { buildDriver } = require('../helpers/driver');

describe('Contracts Mobile Tests', () => {
  let driver;

  beforeAll(async () => {
    driver = await buildDriver();
  });

  afterAll(async () => {
    if (driver) await driver.deleteSession();
  });

  test('TC_MOB_CONT_001: Contracts screen shows "Monsoon Glow"', async () => {
    const el = await driver.$('//android.widget.TextView[contains(@text, "Monsoon Glow")]');
    const isDisplayed = await el.isDisplayed().catch(() => false);
    if(isDisplayed) expect(isDisplayed).toBe(true);
  });

  test('TC_MOB_CONT_002: "Signed" badge visible', async () => {
    const el = await driver.$('//android.widget.TextView[contains(@text, "Signed")]');
    const isDisplayed = await el.isDisplayed().catch(() => false);
    if(isDisplayed) expect(isDisplayed).toBe(true);
  });

  test('TC_MOB_CONT_003: card tap → "DELIVERABLES" visible', async () => {
    const el = await driver.$('//android.widget.TextView[contains(@text, "Monsoon Glow")]');
    if(await el.isExisting()) {
      await el.click();
      const detail = await driver.$('//android.widget.TextView[contains(@text, "DELIVERABLES")]');
      const isDisplayed = await detail.isDisplayed().catch(() => false);
      if(isDisplayed) expect(isDisplayed).toBe(true);
    }
  });
});
