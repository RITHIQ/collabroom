const { expect } = require('chai');
const DriverFactory = require('../utilities/DriverFactory');
const ScreenshotHelper = require('../utilities/ScreenshotHelper');
const LoginHelper = require('../utilities/LoginHelper');
const ProfilePage = require('../pages/ProfilePage');

describe('Tier 2 - Profile', function() {
  let driver;
  let profilePage;
  let loginSuccess = false;

  before(async function() {
    driver = await DriverFactory.createDriver();
    profilePage = new ProfilePage(driver);
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

  it('TC_PROF_001: Profile page loads at /#/profile', async function() {
    await profilePage.navigate('/#/profile');
    await profilePage.waitForPageLoad();
    const isVisible = await profilePage.isLoaded();
    expect(isVisible).to.be.true;
  });

  it('TC_PROF_002: Avatar visible', async function() {
    const isVisible = await profilePage.isVisible(profilePage.avatar);
    expect(isVisible).to.be.true;
  });

  it('TC_PROF_006: Completeness bar visible', async function() {
    const isVisible = await profilePage.isVisible(profilePage.completenessBar);
    expect(isVisible).to.be.true;
  });
});
