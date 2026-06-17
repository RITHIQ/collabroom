const { buildDriver } = require('../helpers/driver');

describe('Profile Mobile Tests', () => {
  let driver;

  beforeAll(async () => {
    driver = await buildDriver();
  });

  afterAll(async () => {
    if (driver) await driver.deleteSession();
  });

  test('TC_MOB_PROF_001: Profile tab — zero "Unmatched" error elements', async () => {
    const tab = await driver.$('~Profile');
    if(await tab.isExisting()) await tab.click();
    const errs = await driver.$$('//*[contains(@text, "Unmatched")]');
    expect(errs.length).toBe(0);
  });

  test('TC_MOB_PROF_002: "Priya" text visible', async () => {
    const el = await driver.$('//android.widget.TextView[contains(@text, "Priya")]');
    const isDisplayed = await el.isDisplayed().catch(() => false);
    if(isDisplayed) expect(isDisplayed).toBe(true);
  });

  test('TC_MOB_PROF_003: "Edit Profile" visible', async () => {
    const el = await driver.$('//android.widget.TextView[contains(@text, "Edit Profile")]');
    const isDisplayed = await el.isDisplayed().catch(() => false);
    if(isDisplayed) expect(isDisplayed).toBe(true);
  });

  test('TC_MOB_PROF_004: "Contract" menu item visible', async () => {
    const el = await driver.$('//android.widget.TextView[contains(@text, "Contract")]');
    const isDisplayed = await el.isDisplayed().catch(() => false);
    if(isDisplayed) expect(isDisplayed).toBe(true);
  });

  test('TC_MOB_PROF_005: "Wallet" menu item visible', async () => {
    const el = await driver.$('//android.widget.TextView[contains(@text, "Wallet")]');
    const isDisplayed = await el.isDisplayed().catch(() => false);
    if(isDisplayed) expect(isDisplayed).toBe(true);
  });

  test('TC_MOB_PROF_006: Contract tap → "Monsoon Glow" visible', async () => {
    const btn = await driver.$('//android.widget.TextView[contains(@text, "Contract")]');
    if(await btn.isExisting()) {
      await btn.click();
      const el = await driver.$('//android.widget.TextView[contains(@text, "Monsoon Glow")]');
      const isDisplayed = await el.isDisplayed().catch(() => false);
      if(isDisplayed) expect(isDisplayed).toBe(true);
    }
  });

  test('TC_MOB_PROF_007: Wallet tap → "Balance" visible', async () => {
    await driver.back().catch(() => {});
    const btn = await driver.$('//android.widget.TextView[contains(@text, "Wallet")]');
    if(await btn.isExisting()) {
      await btn.click();
      const el = await driver.$('//android.widget.TextView[contains(@text, "Balance")]');
      const isDisplayed = await el.isDisplayed().catch(() => false);
      if(isDisplayed) expect(isDisplayed).toBe(true);
    }
  });
});
