const BasePage = require('./BasePage');
const { By } = require('selenium-webdriver');

class AuthPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.emailInput = By.css('[data-testid="email-input"]');
    this.googleSigninBtn = By.css('[data-testid="google-signin"]');
    this.logo = By.css('[data-testid="logo"]');
    this.loginSubmitBtn = By.id('login-submit');
  }

  async isLoaded() {
    return await this.isVisible(this.logo);
  }

  async getLogo() {
    return await this.findElement(this.logo);
  }

  async getEmailInput() {
    return await this.findElement(this.emailInput);
  }

  async getPasswordInput() {
    return await this.findElement(By.id('login-password'));
  }

  async clickGoogleSignin() {
    await this.click(this.googleSigninBtn);
  }

  async login(email, password) {
    await this.type(this.emailInput, email);
    await this.type(By.id('login-password'), password);
    await this.click(this.loginSubmitBtn);
  }
}

module.exports = AuthPage;
