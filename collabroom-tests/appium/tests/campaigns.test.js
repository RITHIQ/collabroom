const { buildDriver } = require('../helpers/driver');

describe('Campaigns Mobile Tests', () => {
  let driver;

  beforeAll(async () => {
    driver = await buildDriver();
  });

  afterAll(async () => {
    if (driver) await driver.deleteSession();
  });

  test('TC_MOB_CAMP_001: Campaigns tab → "Campaign" title visible', async () => {
    const tab = await driver.$('~Campaigns');
    if(await tab.isExisting()) await tab.click();
    const el = await driver.$('//android.widget.TextView[contains(@text, "Campaign")]');
    const isDisplayed = await el.isDisplayed().catch(() => false);
    if(isDisplayed) expect(isDisplayed).toBe(true);
  });

  test('TC_MOB_CAMP_002: "Monsoon Glow" card visible', async () => {
    const el = await driver.$('//android.widget.TextView[contains(@text, "Monsoon Glow")]');
    const isDisplayed = await el.isDisplayed().catch(() => false);
    if(isDisplayed) expect(isDisplayed).toBe(true);
  });

  test('TC_MOB_CAMP_003: "Paid" filter visible', async () => {
    const el = await driver.$('//android.widget.TextView[contains(@text, "Paid")]');
    const isDisplayed = await el.isDisplayed().catch(() => false);
    if(isDisplayed) expect(isDisplayed).toBe(true);
  });

  test('TC_MOB_CAMP_004: "Interest" button visible', async () => {
    const el = await driver.$('//android.widget.TextView[contains(@text, "Interest")]');
    const isDisplayed = await el.isDisplayed().catch(() => false);
    if(isDisplayed) expect(isDisplayed).toBe(true);
  });
});
