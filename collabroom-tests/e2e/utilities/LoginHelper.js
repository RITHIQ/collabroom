const { By } = require('selenium-webdriver');
const config = require('../config/config');
const testData = require('../config/testData');
const WaitHelper = require('./WaitHelper');
const logger = require('./Logger');

class LoginHelper {
  static async login(driver, role) {
    const user = role.toUpperCase() === 'CREATOR' ? testData.CREATOR : testData.BRAND;
    
    logger.info(`Navigating to login page for role: ${role}`);
    await driver.get(`${config.BASE_URL}/#/login`);
    
    try {
      // Find email input and type email
      const emailLocator = By.css('[data-testid="email-input"]');
      await WaitHelper.waitForVisible(driver, emailLocator);
      const emailInput = await driver.findElement(emailLocator);
      await emailInput.clear();
      await emailInput.sendKeys(user.email);
      
      // Find password input (app uses standard password form, not OTP)
      const passwordLocator = By.id('login-password');
      await WaitHelper.waitForVisible(driver, passwordLocator);
      const passwordInput = await driver.findElement(passwordLocator);
      await passwordInput.clear();
      await passwordInput.sendKeys(user.password);
      
      // Click login submit
      const submitBtnLocator = By.id('login-submit');
      await WaitHelper.waitForClickable(driver, submitBtnLocator);
      await driver.findElement(submitBtnLocator).click();
      
      // Wait for navigation away from login
      try {
        await driver.wait(async () => {
          const url = await driver.getCurrentUrl();
          return !url.includes('/#/login');
        }, 5000);
      } catch (e) {
        logger.warn(`Login failed or timed out for ${role}. Staying on login page.`);
        return false;
      }
      logger.info(`Successfully logged in as ${user.email}`);
      
      // Framer motion sleep
      await WaitHelper.sleep(1500);
      return true;
    } catch (e) {
      logger.error(`Login failed for ${role}: ${e.message}`);
      return false;
    }
  }

  static async loginAsCreator(driver) {
    return await this.login(driver, 'CREATOR');
  }

  static async loginAsBrand(driver) {
    return await this.login(driver, 'BRAND');
  }
}

module.exports = LoginHelper;
