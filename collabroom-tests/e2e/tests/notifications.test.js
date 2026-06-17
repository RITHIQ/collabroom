const { expect } = require('chai');
const DriverFactory = require('../utilities/DriverFactory');
const ScreenshotHelper = require('../utilities/ScreenshotHelper');
const LoginHelper = require('../utilities/LoginHelper');
const NotificationsPage = require('../pages/NotificationsPage');

describe('Tier 2 - Notifications', function() {
  let driver;
  let notificationsPage;
  let loginSuccess = false;

  before(async function() {
    driver = await DriverFactory.createDriver();
    notificationsPage = new NotificationsPage(driver);
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

  it('TC_NOTIF_001: Notifications page loads at /#/notifications', async function() {
    await notificationsPage.navigate('/#/notifications');
    await notificationsPage.waitForPageLoad();
    const isVisible = await notificationsPage.isLoaded();
    expect(isVisible).to.be.true;
  });

  it('TC_NOTIF_003: Mark all read button visible', async function() {
    const isVisible = await notificationsPage.isVisible(notificationsPage.markAllReadBtn);
    expect(isVisible).to.be.true;
  });
});
