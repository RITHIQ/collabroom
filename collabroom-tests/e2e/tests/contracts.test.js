const { expect } = require('chai');
const DriverFactory = require('../utilities/DriverFactory');
const ScreenshotHelper = require('../utilities/ScreenshotHelper');
const LoginHelper = require('../utilities/LoginHelper');
const ContractsPage = require('../pages/ContractsPage');

describe('Tier 2 - Contracts', function() {
  let driver;
  let contractsPage;
  let loginSuccess = false;

  before(async function() {
    driver = await DriverFactory.createDriver();
    contractsPage = new ContractsPage(driver);
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

  it('TC_CONT_001: Contracts page loads at /#/contracts', async function() {
    await contractsPage.navigate('/#/contracts');
    await contractsPage.waitForPageLoad();
    const isVisible = await contractsPage.isLoaded();
    expect(isVisible).to.be.true;
  });

  it('TC_CONT_002: At least 1 contract card', async function() {
    const isVisible = await contractsPage.isVisible(contractsPage.contractCards);
    expect(isVisible).to.be.true;
  });
});
