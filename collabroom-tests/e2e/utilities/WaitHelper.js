const { until } = require('selenium-webdriver');
const config = require('../config/config');

class WaitHelper {
  static async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async waitForElement(driver, locator, timeout = config.IMPLICIT_WAIT) {
    return await driver.wait(until.elementLocated(locator), timeout, `Element not located: ${locator}`);
  }

  static async waitForVisible(driver, locator, timeout = config.IMPLICIT_WAIT) {
    const element = await this.waitForElement(driver, locator, timeout);
    return await driver.wait(until.elementIsVisible(element), timeout, `Element not visible: ${locator}`);
  }

  static async waitForClickable(driver, locator, timeout = config.IMPLICIT_WAIT) {
    const element = await this.waitForVisible(driver, locator, timeout);
    return await driver.wait(until.elementIsEnabled(element), timeout, `Element not clickable: ${locator}`);
  }

  static async waitForURL(driver, urlFragment, timeout = config.IMPLICIT_WAIT) {
    return await driver.wait(until.urlContains(urlFragment), timeout, `URL did not contain: ${urlFragment}`);
  }

  static async waitForText(driver, locator, text, timeout = config.IMPLICIT_WAIT) {
    const element = await this.waitForElement(driver, locator, timeout);
    return await driver.wait(until.elementTextContains(element, text), timeout, `Element did not contain text: ${text}`);
  }
}

module.exports = WaitHelper;
