const BasePage = require('./BasePage');
const { By } = require('selenium-webdriver');

class CampaignsPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.campaignCards = By.css('[data-testid="campaign-card"]');
    this.submitInterestBtn = By.css('[data-testid="submit-interest-btn"]');
    this.createBtn = By.xpath('//button[contains(text(), "Create") or contains(text(), "New Campaign")]');
    this.filterTabs = By.css('.tab-button'); // Adjust if class differs
  }

  async isLoaded() {
    return await this.isPresent(this.campaignCards) || await this.isPresent(By.css('.page-title'));
  }

  async getCampaignCards() {
    return await this.driver.findElements(this.campaignCards);
  }

  async clickFirstCard() {
    const cards = await this.getCampaignCards();
    if (cards.length > 0) {
      await cards[0].click();
    }
  }

  async clickSubmitInterest() {
    await this.click(this.submitInterestBtn);
  }
}

module.exports = CampaignsPage;
