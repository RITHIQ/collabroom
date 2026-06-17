const { expect } = require('chai');
const DriverFactory = require('../utilities/DriverFactory');
const ScreenshotHelper = require('../utilities/ScreenshotHelper');
const LoginHelper = require('../utilities/LoginHelper');
const CollabRoomPage = require('../pages/CollabRoomPage');

describe('Tier 2 - Collab Room', function() {
  let driver;
  let collabRoomPage;
  let loginSuccess = false;

  before(async function() {
    driver = await DriverFactory.createDriver();
    collabRoomPage = new CollabRoomPage(driver);
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

  it('TC_COLLAB_001: Collab room loads at /#/collab-room/room-001', async function() {
    await collabRoomPage.navigate('/#/collab-room/room-001');
    await collabRoomPage.waitForPageLoad();
    // Assuming timeline is visible if loaded
    const isLoaded = await collabRoomPage.isPresent(collabRoomPage.messageArea);
    expect(isLoaded).to.be.true;
  });

  it('TC_COLLAB_002: Milestone timeline visible', async function() {
    const isVisible = await collabRoomPage.isVisible(collabRoomPage.milestoneTimeline);
    expect(isVisible).to.be.true;
  });

  it('TC_COLLAB_003: Message area visible', async function() {
    const isVisible = await collabRoomPage.isVisible(collabRoomPage.messageArea);
    expect(isVisible).to.be.true;
  });

  it('TC_COLLAB_004: Message input visible', async function() {
    const isVisible = await collabRoomPage.isVisible(collabRoomPage.messageInput);
    expect(isVisible).to.be.true;
  });
});
