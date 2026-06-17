const { expect } = require('chai');
const DriverFactory = require('../utilities/DriverFactory');
const ScreenshotHelper = require('../utilities/ScreenshotHelper');
const LoginHelper = require('../utilities/LoginHelper');
const DashboardPage = require('../pages/DashboardPage');

describe('Tier 2 - Dashboard', function() {
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

  it('TC_DASH_001: Dashboard wrapper visible', async function() {
    await dashboardPage.navigate('/#/dashboard');
    await dashboardPage.waitForPageLoad();
    const isVisible = await dashboardPage.isLoaded();
    expect(isVisible).to.be.true;
  });

  it('TC_DASH_002: Sidebar navigation visible', async function() {
    const isVisible = await dashboardPage.isVisible(dashboardPage.sidebar);
    expect(isVisible).to.be.true;
  });

  it('TC_DASH_003: Wallet balance section visible', async function() {
    const isVisible = await dashboardPage.isVisible(dashboardPage.walletBalance);
    expect(isVisible).to.be.true;
  });
});
