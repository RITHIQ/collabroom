const { expect } = require('chai');
const DriverFactory = require('../utilities/DriverFactory');
const ScreenshotHelper = require('../utilities/ScreenshotHelper');
const LoginHelper = require('../utilities/LoginHelper');
const CampaignsPage = require('../pages/CampaignsPage');

describe('Tier 2 - Campaigns', function() {
  let driver;
  let campaignsPage;
  let loginSuccess = false;

  before(async function() {
    driver = await DriverFactory.createDriver();
    campaignsPage = new CampaignsPage(driver);
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

  it('TC_CAMP_001: Campaigns page loads at /#/campaigns', async function() {
    await campaignsPage.navigate('/#/campaigns');
    await campaignsPage.waitForPageLoad();
    const isVisible = await campaignsPage.isLoaded();
    expect(isVisible).to.be.true;
  });

  it('TC_CAMP_002: At least 1 campaign card visible', async function() {
    const isVisible = await campaignsPage.isVisible(campaignsPage.campaignCards);
    expect(isVisible).to.be.true;
  });
});
