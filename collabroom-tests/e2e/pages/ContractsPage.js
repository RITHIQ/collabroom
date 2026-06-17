const BasePage = require('./BasePage');
const { By } = require('selenium-webdriver');

class ContractsPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.contractCards = By.css('[data-testid="contract-card"]');
    this.contractStatus = By.css('[data-testid="contract-status"]');
  }

  async isLoaded() {
    return await this.isPresent(this.contractCards) || await this.isPresent(By.css('.page-title'));
  }

  async getContractCards() {
    return await this.driver.findElements(this.contractCards);
  }

  async getStatusBadges() {
    return await this.driver.findElements(this.contractStatus);
  }
}

module.exports = ContractsPage;
