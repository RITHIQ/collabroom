const { expect } = require('chai');
const DriverFactory = require('../utilities/DriverFactory');
const ScreenshotHelper = require('../utilities/ScreenshotHelper');
const WaitHelper = require('../utilities/WaitHelper');
const AuthPage = require('../pages/AuthPage');
const { By } = require('selenium-webdriver');

describe('Tier 1 - Forms', function() {
  let driver;
  let authPage;

  before(async function() {
    driver = await DriverFactory.createDriver();
    authPage = new AuthPage(driver);
  });

  after(async function() {
    await DriverFactory.quitDriver(driver);
  });

  afterEach(async function() {
    if (this.currentTest.state === 'failed') {
      await ScreenshotHelper.captureFailure(driver, this.currentTest.title, this.currentTest.err);
    }
  });

  it('TC_FORM_001: Email field on /#/login — empty submit shows validation', async function() {
    await authPage.navigate('/#/login');
    await authPage.waitForPageLoad();
    const emailInput = await authPage.getEmailInput();
    
    // Clear and submit empty
    await emailInput.clear();
    await authPage.click(authPage.loginSubmitBtn);
    
    // Check for native validation (required attribute)
    const isValid = await driver.executeScript('return arguments[0].checkValidity()', emailInput);
    expect(isValid).to.be.false;
  });

  it('TC_FORM_002: Email field — invalid format shows error', async function() {
    await authPage.navigate('/#/login');
    const emailInput = await authPage.getEmailInput();
    
    await emailInput.clear();
    await emailInput.sendKeys('notanemail');
    await authPage.click(authPage.loginSubmitBtn);
    
    const isValid = await driver.executeScript('return arguments[0].checkValidity()', emailInput);
    expect(isValid).to.be.false;
  });

  it('TC_FORM_003: Email field — valid format accepted', async function() {
    await authPage.navigate('/#/login');
    const emailInput = await authPage.getEmailInput();
    
    await emailInput.clear();
    await emailInput.sendKeys('test@test.com');
    // We only type the email to test its valid format
    const isValid = await driver.executeScript('return arguments[0].checkValidity()', emailInput);
    expect(isValid).to.be.true;
  });
});
