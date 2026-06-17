const { remote } = require('webdriverio');

async function buildDriver() {
  const capabilities = {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:appPackage': 'com.collabroom',
    'appium:appActivity': '.MainActivity',
    'appium:app': process.env.APK_PATH || './collabroom.apk',
    'appium:noReset': true,
    'appium:fullReset': false
  };

  const driver = await remote({
    path: '/',
    port: 4723,
    capabilities
  });

  return driver;
}

module.exports = { buildDriver };
