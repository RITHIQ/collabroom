const { until } = require('selenium-webdriver');

class BrowserHelper {
  static async executeScript(driver, script, ...args) {
    return await driver.executeScript(script, ...args);
  }

  static async scrollToElement(driver, element) {
    await this.executeScript(driver, "arguments[0].scrollIntoView(true);", element);
  }

  static async scrollToBottom(driver) {
    await this.executeScript(driver, "window.scrollTo(0, document.body.scrollHeight);");
  }

  static async scrollToTop(driver) {
    await this.executeScript(driver, "window.scrollTo(0, 0);");
  }

  static async switchToNewTab(driver) {
    const handles = await driver.getAllWindowHandles();
    if (handles.length > 1) {
      await driver.switchTo().window(handles[handles.length - 1]);
      return true;
    }
    return false;
  }

  static async closeTabAndSwitchBack(driver) {
    const handles = await driver.getAllWindowHandles();
    if (handles.length > 1) {
      await driver.close();
      await driver.switchTo().window(handles[0]);
      return true;
    }
    return false;
  }

  static async acceptAlert(driver) {
    try {
      await driver.wait(until.alertIsPresent(), 5000);
      const alert = await driver.switchTo().alert();
      await alert.accept();
      return true;
    } catch (e) {
      return false;
    }
  }

  static async dismissAlert(driver) {
    try {
      await driver.wait(until.alertIsPresent(), 5000);
      const alert = await driver.switchTo().alert();
      await alert.dismiss();
      return true;
    } catch (e) {
      return false;
    }
  }

  static async getAlertText(driver) {
    try {
      await driver.wait(until.alertIsPresent(), 5000);
      const alert = await driver.switchTo().alert();
      return await alert.getText();
    } catch (e) {
      return null;
    }
  }
}

module.exports = BrowserHelper;
