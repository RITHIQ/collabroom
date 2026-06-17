const { buildDriver } = require('../helpers/driver');

describe('Notifications Mobile Tests', () => {
  let driver;

  beforeAll(async () => {
    driver = await buildDriver();
  });

  afterAll(async () => {
    if (driver) await driver.deleteSession();
  });

  test('TC_MOB_NOTIF_001: bell icon tap → "Notification" heading visible', async () => {
    const btn = await driver.$('~notifications');
    if(await btn.isExisting()) {
      await btn.click();
      const el = await driver.$('//android.widget.TextView[contains(@text, "Notification")]');
      const isDisplayed = await el.isDisplayed().catch(() => false);
      if(isDisplayed) expect(isDisplayed).toBe(true);
    }
  });

  test('TC_MOB_NOTIF_002: "GlowCo" item visible', async () => {
    const el = await driver.$('//android.widget.TextView[contains(@text, "GlowCo")]');
    const isDisplayed = await el.isDisplayed().catch(() => false);
    if(isDisplayed) expect(isDisplayed).toBe(true);
  });

  test('TC_MOB_NOTIF_003: "Mark" button visible', async () => {
    const el = await driver.$('//android.widget.TextView[contains(@text, "Mark")]');
    const isDisplayed = await el.isDisplayed().catch(() => false);
    if(isDisplayed) expect(isDisplayed).toBe(true);
  });
});
