const { buildDriver } = require('../helpers/driver');

describe('Auth Mobile Tests', () => {
  let driver;

  beforeAll(async () => {
    driver = await buildDriver();
  });

  afterAll(async () => {
    if (driver) await driver.deleteSession();
  });

  test('TC_MOB_AUTH_001: app package com.collabroom visible', async () => {
    const currentPackage = await driver.getCurrentPackage();
    expect(currentPackage).toBe('com.collabroom');
  });

  test('TC_MOB_AUTH_002: "Creator" text visible', async () => {
    const el = await driver.$('//android.widget.TextView[contains(@text, "Creator")]');
    const isDisplayed = await el.isDisplayed();
    expect(isDisplayed).toBe(true);
  });

  test('TC_MOB_AUTH_003: EditText input visible', async () => {
    const el = await driver.$('//android.widget.EditText');
    const isDisplayed = await el.isDisplayed();
    expect(isDisplayed).toBe(true);
  });

  test('TC_MOB_AUTH_004: "Google" button visible', async () => {
    const el = await driver.$('//android.view.ViewGroup[@content-desc="Google"] | //android.widget.TextView[contains(@text, "Google")]');
    const isDisplayed = await el.isDisplayed();
    expect(isDisplayed).toBe(true);
  });
});
