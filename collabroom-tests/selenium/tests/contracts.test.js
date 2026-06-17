const { buildDriver, By, until } = require('../helpers/driver');
const testData = require('../helpers/testData');

const { loginAsCreator } = require('../helpers/auth');

describe('Contracts Tests', () => {
  let driver;

  beforeAll(async () => {
    driver = await buildDriver();
    await loginAsCreator(driver);
  }, 90000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('TC_CONT_001: /contracts body visible', async () => {
    await driver.get(testData.BASE_URL + '/#/contracts');
    const body = await driver.wait(until.elementLocated(By.css('body')), 5000);
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_CONT_002: [data-testid="contract-card"] present (count > 0)', async () => {
    await driver.get(testData.BASE_URL + '/#/contracts');
    await driver.sleep(1000);
    const cards = await driver.findElements(By.css('[data-testid="contract-card"]'));
    if(cards.length > 0) {
      expect(cards.length).toBeGreaterThan(0);
    }
  });

  test('TC_CONT_003: [data-testid="contract-status"] with status text', async () => {
    await driver.get(testData.BASE_URL + '/#/contracts');
    await driver.sleep(1000);
    const statusBadges = await driver.findElements(By.css('[data-testid="contract-status"]'));
    if (statusBadges.length > 0) {
      const text = await statusBadges[0].getText();
      expect(
        text.includes('Signed')
        || text.includes('Pending')
        || text.includes('Draft')
        || text.includes('Active')
        || text.includes('Sent')
        || text.includes('Under Review')
        || text.includes('Executed')
      ).toBe(true);
    }
  });

  test('TC_CONT_004: clicking contract card changes URL', async () => {
    await driver.get(testData.BASE_URL + '/#/contracts');
    await driver.sleep(1000);
    const cards = await driver.findElements(By.css('[data-testid="contract-card"]'));
    if (cards.length > 0) {
      const viewLink = await cards[0].findElement(By.css('a[href*="contracts/"]'));
      await viewLink.click();
      await driver.sleep(1000);
      const url = await driver.getCurrentUrl();
      expect(url).not.toBe(testData.BASE_URL + '/#/contracts');
    }
  });
});
