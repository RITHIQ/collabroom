# Collabroom Enterprise E2E Automation Framework

Welcome to the **Collabroom Selenium WebDriver E2E Framework**, built with Node.js, Mocha, and Chai. 

This framework is built to strictly adhere to Enterprise QA Automation standards, encompassing:
- **Cross-Browser Support** (Chrome, Edge, Firefox)
- **Data-Driven & Dynamic Testing** (Auto-generation of forms tests)
- **Advanced UI Interactions** (Framer Motion readiness, Waits, JS Execution)
- **Comprehensive Failure Analysis** (Screenshots, console logs, stack traces)
- **Custom Reporting** (Mochawesome HTML + Enterprise Excel Reporter)
- **CI/CD Integration** (GitHub Actions)

## 📁 Directory Structure
```
collabroom-tests/e2e/
├── config/              # Environment config and timeouts
├── data/                # Data-driven JSON files
├── pages/               # Page Object Models (POMs)
├── utilities/           # Selenium wrappers, Waiters, dynamic test generators
├── tests/               # Hardcoded & dynamically generated Mocha specs
├── reports/             # Mochawesome HTML, JSON, and Failures (stack traces/logs)
├── screenshots/         # (Legacy, now mapped into reports/failures)
├── logs/                # Winston execution logs (e2e.log)
├── excel/               # Generated E2E_Report.xlsx
└── .mocharc.js          # Mocha test runner configuration
```

## 🚀 Execution Instructions

### Prerequisites
Make sure your React web app is running locally on port 3000:
```bash
cd ../../web
npm run dev
```

### 1. Install Dependencies
```bash
cd collabroom-tests/e2e
npm install
```

### 2. Run the Dynamic Test Generator
This reads your React source code and builds automated validation tests for any forms it finds.
```bash
node utilities/DynamicTestGenerator.js
```

### 3. Run the E2E Suite
```bash
npm test
```
*Optional environment overrides:*
```bash
BROWSER=firefox HEADLESS=false BASE_URL=http://localhost:3001 npm test
```

### 4. Generate the Enterprise Excel Report
After the test run completes (even if tests failed), parse the results into the 4-Sheet Excel report:
```bash
node utilities/ExcelReporter.js
```

## 🔄 Automated Retries & Parallel Execution
The `.mocharc.js` file is configured for automated retries of flaky tests (`retries: 2`). Parallel execution is currently commented out, but you can enable it by un-commenting `parallel: true` in `.mocharc.js` if running against a grid.
