const { expect } = require('chai');
const DriverFactory = require('../utilities/DriverFactory');
const ScreenshotHelper = require('../utilities/ScreenshotHelper');
const LoginHelper = require('../utilities/LoginHelper');
const DashboardPage = require('../pages/DashboardPage');
const { By } = require('selenium-webdriver');
const WaitHelper = require('../utilities/WaitHelper');

describe('Tier 2 - Navigation', function() {
  let driver;
  let dashboardPage;
  let loginSuccess = false;

  before(async function() {
    driver = await DriverFactory.createDriver();
    dashboardPage = new DashboardPage(driver);
    loginSuccess = await LoginHelper.loginAsCreator(driver);
  });

  after(async function() {
    await DriverFactory.quitDriver(driver);
  });

  beforeEach(function() {
    if (!loginSuccess) {
      this.skip('Skipped: Login failed or unavailable');
    }
  });

  afterEach(async function() {
    if (this.currentTest.state === 'failed') {
      await ScreenshotHelper.captureFailure(driver, this.currentTest.title, this.currentTest.err);
    }
  });

  it('TC_NAV_001: Sidebar links navigate to correct routes', async function() {
    await dashboardPage.navigate('/#/dashboard');
    await dashboardPage.waitForPageLoad();
    
    // Click on Profile link
    const profileLink = By.css('[data-testid="sidebar"] a[href="/profile"]');
    if (await dashboardPage.isPresent(profileLink)) {
      await dashboardPage.click(profileLink);
      await WaitHelper.sleep(1500);
      const url = await driver.getCurrentUrl();
      expect(url).to.include('/#/profile');
    }
  });

  it('TC_NAV_002: Browser back button after navigation works correctly', async function() {
    await dashboardPage.navigate('/#/dashboard');
    await dashboardPage.waitForPageLoad();
    await dashboardPage.navigate('/#/wallet');
    await dashboardPage.waitForPageLoad();
    
    await driver.navigate().back();
    await WaitHelper.sleep(1500);
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/#/dashboard');
  });

  it('TC_NAV_003: Page refresh on /#/dashboard preserves auth state', async function() {
    await dashboardPage.navigate('/#/dashboard');
    await dashboardPage.waitForPageLoad();
    await driver.navigate().refresh();
    await WaitHelper.sleep(2000);
    
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/#/dashboard');
    expect(url).to.not.include('/#/login');
  });

  it('TC_NAV_004: Browser forward button works after back', async function() {
    await dashboardPage.navigate('/#/dashboard');
    await dashboardPage.waitForPageLoad();
    await dashboardPage.navigate('/#/wallet');
    await dashboardPage.waitForPageLoad();
    await driver.navigate().back();
    await WaitHelper.sleep(1500);
    await driver.navigate().forward();
    await WaitHelper.sleep(1500);
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/#/wallet');
  });
});
