const { expect } = require('chai');
const DriverFactory = require('../utilities/DriverFactory');
const ScreenshotHelper = require('../utilities/ScreenshotHelper');
const LoginHelper = require('../utilities/LoginHelper');
const WalletPage = require('../pages/WalletPage');

describe('Tier 2 - Wallet', function() {
  let driver;
  let walletPage;
  let loginSuccess = false;

  before(async function() {
    driver = await DriverFactory.createDriver();
    walletPage = new WalletPage(driver);
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

  it('TC_WALL_001: Wallet page loads at /#/wallet', async function() {
    await walletPage.navigate('/#/wallet');
    await walletPage.waitForPageLoad();
    const isVisible = await walletPage.isLoaded();
    expect(isVisible).to.be.true;
  });

  it('TC_WALL_002: Balance display visible', async function() {
    const isVisible = await walletPage.isVisible(walletPage.availableBalance);
    expect(isVisible).to.be.true;
  });
});
