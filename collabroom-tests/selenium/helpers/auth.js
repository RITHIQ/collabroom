const { By, until } = require('selenium-webdriver');
const testData = require('./testData');

async function waitForDisplayed(driver, locator, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const element = await driver.findElement(locator);
      if (await element.isDisplayed()) return element;
    } catch (err) {
      lastError = err;
    }
    await driver.sleep(250);
  }

  throw lastError || new Error(`Element not visible within ${timeoutMs}ms: ${locator}`);
}

async function waitForUrl(driver, predicate, timeoutMs = 30000) {
  await driver.wait(async () => predicate(await driver.getCurrentUrl()), timeoutMs);
}

async function login(driver, email, password) {
  await driver.get(testData.BASE_URL + '/');
  await driver.sleep(500);
  await driver.executeScript(`localStorage.clear(); sessionStorage.clear();`);
  await driver.get(testData.BASE_URL + '/#/login');
  await driver.sleep(2000);

  const emailInput = await waitForDisplayed(driver, By.css('[data-testid="email-input"]'));
  await emailInput.clear();
  await emailInput.sendKeys(email);

  const passwordInput = await driver.findElement(By.css('#login-password'));
  await passwordInput.clear();
  await passwordInput.sendKeys(password);

  await driver.findElement(By.css('#login-submit')).click();
  await driver.wait(until.urlContains('dashboard'), 30000);
}

async function loginAsCreator(driver) {
  await login(driver, testData.CREATOR_EMAIL, testData.CREATOR_PASSWORD);
}

async function loginAsBrand(driver) {
  await login(driver, testData.BRAND_EMAIL, testData.BRAND_PASSWORD);
}

module.exports = {
  waitForDisplayed,
  waitForUrl,
  loginAsCreator,
  loginAsBrand,
};
