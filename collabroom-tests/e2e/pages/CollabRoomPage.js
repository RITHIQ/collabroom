const BasePage = require('./BasePage');
const { By } = require('selenium-webdriver');
const WaitHelper = require('../utilities/WaitHelper');

class CollabRoomPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.milestoneTimeline = By.css('[data-testid="milestone-timeline"]');
    this.messageArea = By.css('[data-testid="message-area"]');
    this.messageInput = By.css('[data-testid="message-input"]');
  }

  async isLoaded() {
    return await this.isVisible(this.milestoneTimeline);
  }

  async getMilestones() {
    return await this.driver.findElements(By.css('[data-testid="milestone-timeline"] .milestone-item'));
  }

  async sendMessage(text) {
    await this.type(this.messageInput, text);
    // Assuming enter sends the message, or there is a send button.
    const input = await this.findElement(this.messageInput);
    await input.sendKeys('\n');
    await WaitHelper.sleep(1000); // Wait for send animation/request
  }
}

module.exports = CollabRoomPage;
