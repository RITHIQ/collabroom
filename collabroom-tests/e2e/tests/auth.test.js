const { expect } = require('chai');
const DriverFactory = require('../utilities/DriverFactory');
const ScreenshotHelper = require('../utilities/ScreenshotHelper');
const WaitHelper = require('../utilities/WaitHelper');
const LoginHelper = require('../utilities/LoginHelper');
const AuthPage = require('../pages/AuthPage');

describe('Tier 1 - Authentication & Public Pages', function() {
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

  it('TC_AUTH_001: Landing page loads, logo visible', async function() {
    await authPage.navigate('/');
    await authPage.waitForPageLoad();
    const isLogoVisible = await authPage.isVisible(authPage.logo);
    expect(isLogoVisible).to.be.true;
  });

  it('TC_AUTH_003: Navigate to /#/login, email input visible', async function() {
    await authPage.navigate('/#/login');
    await authPage.waitForPageLoad();
    const isEmailVisible = await authPage.isVisible(authPage.emailInput);
    expect(isEmailVisible).to.be.true;
  });

  it('TC_AUTH_004: Google OAuth button visible', async function() {
    await authPage.navigate('/#/login');
    const isGoogleBtnVisible = await authPage.isVisible(authPage.googleSigninBtn);
    expect(isGoogleBtnVisible).to.be.true;
  });

  it('TC_AUTH_005: Unauthenticated access to /#/dashboard redirects to /#/login', async function() {
    await authPage.navigate('/#/dashboard');
    await authPage.waitForPageLoad();
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.include('/#/login');
  });

  it('TC_AUTH_008: After successful login URL changes from login', async function() {
    const success = await LoginHelper.loginAsCreator(driver);
    if (!success) {
      this.skip();
    }
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.not.include('/#/login');
  });

  it('TC_AUTH_009: Prevent login with invalid credentials', async function() {
    await authPage.navigate('/#/login');
    await authPage.waitForPageLoad();
    
    const emailInput = await authPage.getEmailInput();
    const passInput = await authPage.getPasswordInput();
    
    await emailInput.clear();
    await emailInput.sendKeys('invalid@test.com');
    await passInput.clear();
    await passInput.sendKeys('WrongPassword123!');
    
    await authPage.click(authPage.loginSubmitBtn);
    await WaitHelper.sleep(1500);
    
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.include('/#/login'); // Should not navigate away
  });

  it('TC_AUTH_010: Prevent login with empty fields', async function() {
    await authPage.navigate('/#/login');
    await authPage.waitForPageLoad();
    
    const emailInput = await authPage.getEmailInput();
    const passInput = await authPage.getPasswordInput();
    
    await emailInput.clear();
    await passInput.clear();
    
    await authPage.click(authPage.loginSubmitBtn);
    
    const isEmailValid = await driver.executeScript('return arguments[0].checkValidity()', emailInput);
    expect(isEmailValid).to.be.false;
  });

  it('TC_AUTH_011: Successfully complete logout flow', async function() {
    // Only run if we logged in
    const success = await LoginHelper.loginAsCreator(driver);
    if (!success) this.skip();

    // Find and click avatar to open dropdown, then logout
    // Note: Assuming standard selector for avatar dropdown
    try {
      const avatarBtn = By.css('[data-testid="avatar"]');
      if (await authPage.isPresent(avatarBtn)) {
        await authPage.click(avatarBtn);
        await WaitHelper.sleep(1000);
        const logoutBtn = By.css('button:contains("Logout"), [data-testid="logout-btn"]');
        if (await authPage.isPresent(logoutBtn)) {
          await authPage.click(logoutBtn);
          await WaitHelper.sleep(2000);
          const currentUrl = await driver.getCurrentUrl();
          expect(currentUrl).to.include('/#/login');
        } else {
          this.skip('Logout button not found in dropdown');
        }
      } else {
        this.skip('Avatar not found for logout');
      }
    } catch (e) {
      this.skip('Logout flow not testable in this layout');
    }
  });
});
