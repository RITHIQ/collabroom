const BasePage = require('./BasePage');
const { By } = require('selenium-webdriver');

class ProfilePage extends BasePage {
  constructor(driver) {
    super(driver);
    this.avatar = By.css('[data-testid="avatar"]');
    this.completenessBar = By.css('[data-testid="completeness-bar"]');
    this.editBtn = By.xpath('//button[contains(text(), "Edit profile") or contains(text(), "Edit Profile")]');
    this.socialSection = By.css('[data-testid="social-section"]');
  }

  async isLoaded() {
    return await this.isVisible(this.avatar);
  }

  async getAvatar() {
    return await this.findElement(this.avatar);
  }

  async getCompletenessBar() {
    return await this.findElement(this.completenessBar);
  }
}

module.exports = ProfilePage;
