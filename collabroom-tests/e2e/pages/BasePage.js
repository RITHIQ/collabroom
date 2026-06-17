const config = require('../config/config');
const WaitHelper = require('../utilities/WaitHelper');

class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async navigate(path) {
    await this.driver.get(`${config.BASE_URL}${path}`);
  }

  async findElement(locator, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        await WaitHelper.waitForElement(this.driver, locator);
        return await this.driver.findElement(locator);
      } catch (e) {
        if (i === retries - 1) throw e;
        await WaitHelper.sleep(500);
      }
    }
  }

  async click(locator) {
    const element = await this.findElement(locator);
    await WaitHelper.waitForClickable(this.driver, locator);
    await element.click();
  }

  async type(locator, text) {
    const element = await this.findElement(locator);
    await WaitHelper.waitForVisible(this.driver, locator);
    await element.clear();
    await element.sendKeys(text);
  }

  async getText(locator) {
    const element = await this.findElement(locator);
    await WaitHelper.waitForVisible(this.driver, locator);
    return await element.getText();
  }

  async isVisible(locator) {
    try {
      const element = await this.findElement(locator, 1);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  async isPresent(locator) {
    try {
      await this.findElement(locator, 1);
      return true;
    } catch {
      return false;
    }
  }

  async scrollToElement(locator) {
    const element = await this.findElement(locator);
    await this.driver.executeScript("arguments[0].scrollIntoView(true);", element);
  }

  async waitForPageLoad() {
    await WaitHelper.sleep(1500); // Wait for framer motion animations
  }
}

module.exports = BasePage;
