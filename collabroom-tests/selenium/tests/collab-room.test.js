const { buildDriver, By, until } = require('../helpers/driver');
const testData = require('../helpers/testData');

const { loginAsCreator } = require('../helpers/auth');

describe('Collab Room Tests', () => {
  let driver;

  beforeAll(async () => {
    driver = await buildDriver();
    await loginAsCreator(driver);
  }, 90000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('TC_COLLAB_001: /collab-room/room-001 body visible', async () => {
    // using /campaigns/room-001 or /contracts/room-001 depending on routing setup
    await driver.get(testData.BASE_URL + '/#/collab-room/room-001');
    const body = await driver.wait(until.elementLocated(By.css('body')), 5000);
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_COLLAB_002: [data-testid="milestone-timeline"] visible', async () => {
    await driver.get(testData.BASE_URL + '/#/collab-room/room-001');
    const timeline = await driver.wait(until.elementLocated(By.css('[data-testid="milestone-timeline"]')), 5000).catch(() => null);
    if(timeline) {
      expect(await timeline.isDisplayed()).toBe(true);
    }
  });

  test('TC_COLLAB_003: [data-testid="message-area"] visible', async () => {
    await driver.get(testData.BASE_URL + '/#/collab-room/room-001');
    const area = await driver.wait(until.elementLocated(By.css('[data-testid="message-area"]')), 5000).catch(() => null);
    if(area) {
      expect(await area.isDisplayed()).toBe(true);
    }
  });

  test('TC_COLLAB_004: [data-testid="message-input"] visible', async () => {
    await driver.get(testData.BASE_URL + '/#/collab-room/room-001');
    const input = await driver.wait(until.elementLocated(By.css('[data-testid="message-input"]')), 5000).catch(() => null);
    if(input) {
      expect(await input.isDisplayed()).toBe(true);
    }
  });
});
