const BasePage = require('./BasePage');
const { By } = require('selenium-webdriver');

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.dashboard = By.css('[data-testid="dashboard"]');
    this.sidebar = By.css('[data-testid="sidebar"]');
    this.walletBalance = By.css('[data-testid="wallet-balance"]');
  }

  async isLoaded() {
    return await this.isVisible(this.dashboard);
  }

  async getWalletBalance() {
    return await this.getText(this.walletBalance);
  }

  async getSidebarLinks() {
    return await this.driver.findElements(By.css('[data-testid="sidebar"] a'));
  }
}

module.exports = DashboardPage;
