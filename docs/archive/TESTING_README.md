# ColabRoom — Complete Test Suite

Two completely separate test suites for the ColabRoom platform:

| Suite | Technology | Target | Location |
|-------|-----------|--------|----------|
| **Web E2E** | Selenium WebDriver (Node.js) | Web app (localhost:3000) | `selenium_tests/` |
| **Mobile E2E** | Appium + WebdriverIO (Node.js) | Android APK | `appium_tests/` |

Both suites generate **Excel reports (.xlsx)** with:
- Summary sheet (pass/fail/skip counts + pass rate)
- Detailed results sheet (per-test status, duration, errors)
- Failed Tests sheet
- Skipped Tests sheet (mobile only)

---

## 🌐 Web Tests (Selenium)

### Prerequisites
- Google Chrome installed
- Web app running: `cd web && npm run dev`

### Run
```powershell
cd selenium_tests
npm install       # first time only
node runner.js
```

### What's Tested (60 Tests across 5 Suites)

| Suite | Description |
|-------|-------------|
| `01_landing_public` | Landing page, Login, Register, 404, Public pages |
| `02_auth_flows` | Login validation, role selection, redirects, password visibility |
| `03_dashboard_pages` | All 13 authenticated app pages (uses mock auth) |
| `04_admin_pages` | Admin login, dashboard, users, campaigns, disputes, announcements |
| `05_ui_components` | JS errors, dark theme, nav links, form accessibility |

### Report Output
```
selenium_tests/reports/web_e2e_report.xlsx
```

---

## 📱 Mobile Tests (Appium)

### Prerequisites
1. Install [Android Studio](https://developer.android.com/studio) + Android SDK
2. Set `ANDROID_HOME` environment variable
3. Install Appium globally: `npm install -g appium`
4. Install driver: `appium driver install uiautomator2`
5. Download your APK from the EAS build link
6. Connect Android phone (USB Debugging ON) OR start emulator
7. Verify: `adb devices`
8. **Update `appium_tests/config.js`** with:
   - Your APK file path
   - Device name / Android version
   - App package name

### Run
```powershell
# Terminal 1 — Start Appium server
npx appium

# Terminal 2 — Run tests
cd appium_tests
npm install       # first time only
node runner.js
```

### What's Tested (37 Tests across 5 Suites)

| Suite | Description |
|-------|-------------|
| `01_launch_auth` | App launch, auth screen, email/password fields, invalid login |
| `02_navigation` | Tab bar navigation (Home, Campaigns, Messages, Discover, Profile, AI) |
| `03_home_screen` | Dashboard stats, campaigns section, scroll, wallet |
| `04_campaigns` | Campaign list, filter tabs, scroll, card tapping |
| `05_profile_wallet_discover` | Profile, discover listing, messages, AI brief, responsiveness |

### Report Output
```
appium_tests/reports/mobile_e2e_report.xlsx
```

---

## 📊 Excel Report Sheets

Each report has:
- **Summary** — Overall stats + per-suite breakdown table  
- **Detailed Results** — Every test with status, URL/screen, duration, error  
- **⚠ Failed Tests** — Only failures (for quick bug fixing)  
- **⚠ Skipped Tests** (mobile) — Tests that need real device/auth to run

---

## 🔧 Configuration

### Web (`selenium_tests/config.js`)
```js
BASE_URL: 'http://localhost:3000',
HEADLESS: false,   // set true for CI runs
```

### Mobile (`appium_tests/config.js`)
```js
'appium:app': 'C:\\Users\\...\\colabroom-preview.apk',  // ← Update this!
'appium:deviceName': 'Android Device',
'appium:platformVersion': '12',
```
