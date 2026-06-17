const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const edge = require('selenium-webdriver/edge');
const config = require('../config/config');

class DriverFactory {
  static async createDriver() {
    let driver;
    const browser = config.BROWSER.toLowerCase();
    
    switch (browser) {
      case 'firefox': {
        const options = new firefox.Options();
        if (config.HEADLESS) options.addArguments('-headless'); // Firefox uses -headless
        options.addArguments('--window-size=1920,1080');
        driver = await new Builder().forBrowser('firefox').setFirefoxOptions(options).build();
        break;
      }
      case 'edge': {
        const options = new edge.Options();
        if (config.HEADLESS) options.addArguments('--headless=new'); // Edge chromium uses new headless
        options.addArguments('--window-size=1920,1080');
        options.addArguments('--disable-dev-shm-usage');
        driver = await new Builder().forBrowser('MicrosoftEdge').setEdgeOptions(options).build();
        break;
      }
      case 'chrome':
      default: {
        const options = new chrome.Options();
        if (config.HEADLESS) options.addArguments('--headless=new');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--window-size=1920,1080');
        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
        break;
      }
    }

    await driver.manage().setTimeouts({
      implicit: config.IMPLICIT_WAIT,
      pageLoad: config.PAGE_LOAD_TIMEOUT,
    });

    return driver;
  }

  static async quitDriver(driver) {
    if (driver) {
      await driver.quit();
    }
  }
}

module.exports = DriverFactory;
