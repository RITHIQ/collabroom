require('dotenv').config();

module.exports = {
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
  BROWSER: process.env.BROWSER || 'chrome',
  HEADLESS: process.env.HEADLESS === 'true' || true,
  IMPLICIT_WAIT: parseInt(process.env.IMPLICIT_WAIT, 10) || 10000,
  PAGE_LOAD_TIMEOUT: parseInt(process.env.PAGE_LOAD_TIMEOUT, 10) || 30000,
};
