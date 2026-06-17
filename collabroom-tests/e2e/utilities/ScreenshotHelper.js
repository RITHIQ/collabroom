const fs = require('fs');
const path = require('path');

// Ensure failures directory exists
const failuresDir = path.join(__dirname, '../reports/failures');
if (!fs.existsSync(failuresDir)) {
  fs.mkdirSync(failuresDir, { recursive: true });
}

class ScreenshotHelper {
  static async captureScreenshot(driver, testName) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${testName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${timestamp}.png`;
      const filepath = path.join(failuresDir, filename);
      
      const image = await driver.takeScreenshot();
      fs.writeFileSync(filepath, image, 'base64');
      return filepath;
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      return null;
    }
  }

  static async captureFailure(driver, testName, error) {
    const screenshotPath = await this.captureScreenshot(driver, testName);
    
    try {
      const currentUrl = await driver.getCurrentUrl();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${testName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${timestamp}.json`;
      const filepath = path.join(failuresDir, filename);
      
      // Attempt to get browser console logs (Only works for Chrome/Edge typically)
      let browserLogs = [];
      try {
        const logs = await driver.manage().logs().get('browser');
        browserLogs = logs.map(l => `[${l.level.name}] ${l.message}`);
      } catch (logErr) {
        // Ignored, not all browsers support this
      }
      
      const failureData = {
        testName,
        url: currentUrl,
        error: error.message,
        stack: error.stack,
        consoleLogs: browserLogs,
        timestamp,
        screenshotPath
      };
      
      fs.writeFileSync(filepath, JSON.stringify(failureData, null, 2));
    } catch (e) {
      console.error('Failed to save failure data:', e);
    }
    
    return screenshotPath;
  }
}

module.exports = ScreenshotHelper;
