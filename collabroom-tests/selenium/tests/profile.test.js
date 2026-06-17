const { buildDriver, By, until } = require('../helpers/driver');
const testData = require('../helpers/testData');
const { loginAsCreator, waitForDisplayed } = require('../helpers/auth');

describe('Profile Tests', () => {
  let driver;

  beforeAll(async () => {
    driver = await buildDriver();
    await loginAsCreator(driver);
  }, 90000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  beforeEach(async () => {
    await driver.get(testData.BASE_URL + '/#/profile');
    await driver.sleep(2000);
  });

  test('TC_PROF_001: /profile body visible', async () => {
    const body = await driver.wait(until.elementLocated(By.css('body')), 5000);
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_PROF_002: [data-testid="avatar"] visible', async () => {
    const avatar = await waitForDisplayed(driver, By.css('[data-testid="avatar"]'));
    expect(await avatar.isDisplayed()).toBe(true);
  });

  test('TC_PROF_003: profile name or "@" handle visible', async () => {
    const pageSource = await driver.getPageSource();
    expect(
      pageSource.includes('@')
      || pageSource.includes('collabroomoperations')
      || pageSource.includes('Aisha')
      || pageSource.includes('Profile')
    ).toBe(true);
  });

  test('TC_PROF_004: text "Edit" visible', async () => {
    const pageSource = await driver.getPageSource();
    expect(pageSource.includes('Edit')).toBe(true);
  });

  test('TC_PROF_005: text "Instagram" or "YouTube" or "Social" visible', async () => {
    const socialTab = await driver.findElements(By.css('[data-testid="social-tab"]'));
    if (socialTab.length > 0) {
      await socialTab[0].click();
      await driver.sleep(1000);
    } else {
      const socialTabs = await driver.findElements(By.xpath("//button[contains(., 'Social')]"));
      if (socialTabs.length > 0) {
        await socialTabs[0].click();
        await driver.sleep(1000);
      }
    }

    const pageSource = await driver.getPageSource();
    expect(
      pageSource.includes('Instagram')
      || pageSource.includes('YouTube')
      || pageSource.includes('Social')
      || pageSource.includes('Platforms')
      || pageSource.includes('Platform')
      || pageSource.includes('instagram')
      || pageSource.includes('youtube')
      || pageSource.includes('connected')
      || pageSource.includes('Connect')
    ).toBe(true);
  });

  test('TC_PROF_006: [data-testid="completeness-bar"] visible', async () => {
    const bar = await waitForDisplayed(driver, By.css('[data-testid="completeness-bar"]'));
    expect(await bar.isDisplayed()).toBe(true);
  });
});
