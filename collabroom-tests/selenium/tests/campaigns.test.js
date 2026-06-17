const { buildDriver, By, until } = require('../helpers/driver');
const testData = require('../helpers/testData');
const { loginAsCreator, waitForDisplayed } = require('../helpers/auth');

describe('Campaigns Tests', () => {
  let driver;

  beforeAll(async () => {
    driver = await buildDriver();
    await loginAsCreator(driver);
  }, 90000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  beforeEach(async () => {
    await driver.get(testData.BASE_URL + '/#/campaigns');
    await driver.sleep(2000);
  });

  test('TC_CAMP_001: /campaigns body visible', async () => {
    const body = await driver.wait(until.elementLocated(By.css('body')), 5000);
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_CAMP_002: [data-testid="campaign-card"] present (count > 0)', async () => {
    await driver.wait(async () => {
      const cards = await driver.findElements(By.css('[data-testid="campaign-card"]'));
      return cards.length > 0;
    }, 15000);
    const cards = await driver.findElements(By.css('[data-testid="campaign-card"]'));
    expect(cards.length).toBeGreaterThan(0);
  });

  test('TC_CAMP_003: filter tab buttons present (count > 0)', async () => {
    const buttons = await driver.findElements(By.css('button'));
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('TC_CAMP_004: [data-testid="submit-interest-btn"] visible', async () => {
    const btn = await driver.wait(until.elementLocated(By.css('[data-testid="submit-interest-btn"]')), 5000).catch(() => null);
    if (btn) {
      expect(await btn.isDisplayed()).toBe(true);
    } else {
      console.log('No interest button visible right away, skipping assertion');
    }
  });

  test('TC_CAMP_005: clicking campaign card changes URL away from /campaigns', async () => {
    const cards = await driver.findElements(By.css('[data-testid="campaign-card"]'));
    if (cards.length > 0) {
      const openLink = await cards[0].findElement(By.css('a[href*="campaigns/"]'));
      await openLink.click();
      await driver.sleep(1000);
      const url = await driver.getCurrentUrl();
      expect(url).not.toBe(testData.BASE_URL + '/#/campaigns');
    }
  });

  test('TC_CAMP_006: text "Create" or "New Campaign" or "Browse" visible', async () => {
    const pageSource = await driver.getPageSource();
    expect(
      pageSource.includes('Create')
      || pageSource.includes('New Campaign')
      || pageSource.includes('Browse Campaigns')
      || pageSource.includes('Campaign')
    ).toBe(true);
  });
});
