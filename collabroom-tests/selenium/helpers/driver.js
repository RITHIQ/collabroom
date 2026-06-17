const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');

async function buildDriver() {
  const options = new chrome.Options();
  const headless = process.env.HEADLESS !== 'false';

  if (headless) {
    options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage');
  }

  options.addArguments('--window-size=1920,1080');

  const service = new chrome.ServiceBuilder(chromedriver.path);

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .setChromeService(service)
    .build();

  await driver.manage().setTimeouts({
    implicit: 10000,
    pageLoad: 30000,
  });

  return driver;
}

module.exports = { buildDriver, By, until };
