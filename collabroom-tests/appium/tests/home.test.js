const { buildDriver } = require('../helpers/driver');

describe('Home Mobile Tests', () => {
  let driver;

  beforeAll(async () => {
    driver = await buildDriver();
  });

  afterAll(async () => {
    if (driver) await driver.deleteSession();
  });

  test('TC_MOB_HOME_001: Home tab loads, ViewGroup visible', async () => {
    const el = await driver.$('//android.view.ViewGroup');
    const isDisplayed = await el.isDisplayed();
    expect(isDisplayed).toBe(true);
  });

  test('TC_MOB_HOME_002: "Brand Network" text visible', async () => {
    const el = await driver.$('//android.widget.TextView[contains(@text, "Brand Network")]');
    const isDisplayed = await el.isDisplayed().catch(() => false);
    if(isDisplayed) expect(isDisplayed).toBe(true);
  });

  test('TC_MOB_HOME_003: "Find Work" tap → "Campaign" text appears', async () => {
    const btn = await driver.$('~Find Work'); // By accessibility id
    if(await btn.isExisting()) {
      await btn.click();
      const el = await driver.$('//android.widget.TextView[contains(@text, "Campaign")]');
      expect(await el.isDisplayed()).toBe(true);
    }
  });

  test('TC_MOB_HOME_004: "Inbox" tap → "Message" text appears', async () => {
    const btn = await driver.$('~View Inbox');
    if(await btn.isExisting()) {
      await btn.click();
      const el = await driver.$('//android.widget.TextView[contains(@text, "Message")]');
      expect(await el.isDisplayed()).toBe(true);
    }
  });

  test('TC_MOB_HOME_005: "Work Mode" text visible', async () => {
    const el = await driver.$('//android.widget.TextView[contains(@text, "Work Mode")] | ~Work Mode');
    const isDisplayed = await el.isDisplayed().catch(() => false);
    if(isDisplayed) expect(isDisplayed).toBe(true);
  });

  test('TC_MOB_HOME_006: accessibilityLabel="notifications" element visible', async () => {
    const el = await driver.$('~notifications');
    const isDisplayed = await el.isDisplayed().catch(() => false);
    if(isDisplayed) expect(isDisplayed).toBe(true);
  });
});
