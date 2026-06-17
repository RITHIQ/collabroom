const BasePage = require('./BasePage');
const { By } = require('selenium-webdriver');

class WalletPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.availableBalance = By.css('[data-testid="available-balance"]');
    this.transactionItems = By.css('[data-testid="transaction-item"]');
  }

  async isLoaded() {
    return await this.isVisible(this.availableBalance);
  }

  async getBalance() {
    return await this.getText(this.availableBalance);
  }

  async getTransactions() {
    return await this.driver.findElements(this.transactionItems);
  }
}

module.exports = WalletPage;
