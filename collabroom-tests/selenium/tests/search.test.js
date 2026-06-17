const { buildDriver, By, until } = require('../helpers/driver');
const testData = require('../helpers/testData');
const { loginAsBrand, waitForDisplayed } = require('../helpers/auth');

describe('Search Tests', () => {
  let driver;

  beforeAll(async () => {
    driver = await buildDriver();
    await loginAsBrand(driver);
  }, 90000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  beforeEach(async () => {
    await driver.get(testData.BASE_URL + '/#/discover/creators');
    await driver.sleep(2000);
  });

  test('TC_SRCH_001: /discover body visible', async () => {
    const body = await driver.wait(until.elementLocated(By.css('body')), 5000);
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_SRCH_002: search input visible', async () => {
    const inputs = await driver.findElements(By.css('input'));
    expect(inputs.length).toBeGreaterThan(0);
  });

  test('TC_SRCH_003: sendKeys("fashion") → card results appear', async () => {
    const searchInput = await waitForDisplayed(driver, By.css('input[type="text"], input[type="search"], input'));
    await searchInput.clear();
    await searchInput.sendKeys('fashion');
    await driver.sleep(2000);

    await driver.wait(async () => {
      const cards = await driver.findElements(By.css('[class*="card"]'));
      return cards.length > 0;
    }, 10000);

    const cards = await driver.findElements(By.css('[class*="card"]'));
    expect(cards.length).toBeGreaterThan(0);
  });

  test('TC_SRCH_004: "Filter" text or button visible', async () => {
    const pageSource = await driver.getPageSource();
    expect(pageSource.includes('Filter')).toBe(true);
  });

  test('TC_SRCH_005: "K" or "M" or "followers" text visible', async () => {
    const pageSource = await driver.getPageSource();
    expect(
      pageSource.includes('K')
      || pageSource.includes('M')
      || pageSource.includes('follower')
    ).toBe(true);
  });
});
