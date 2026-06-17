const BasePage = require('./BasePage');
const { By } = require('selenium-webdriver');

class NotificationsPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.notificationItems = By.css('[data-testid="notification-item"]');
    this.markAllReadBtn = By.css('[data-testid="mark-all-read"]');
    this.filterTabs = By.css('.tab-button'); // Adjust if class differs
  }

  async isLoaded() {
    return await this.isPresent(this.notificationItems) || await this.isPresent(By.css('.page-title'));
  }

  async getNotifications() {
    return await this.driver.findElements(this.notificationItems);
  }

  async clickMarkAllRead() {
    await this.click(this.markAllReadBtn);
  }
}

module.exports = NotificationsPage;
