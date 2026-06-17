const fs = require('fs');
const path = require('path');

const reportsDir = path.join(__dirname);
const seleniumResultPath = path.join(__dirname, '../selenium/jest-results.json');
const appiumResultPath = path.join(__dirname, '../appium/jest-results.json');
const dastResultPath = path.join(__dirname, '../dast/automated_test/jest-results.json');

const parseResult = (filePath, suiteName) => {
  if (!fs.existsSync(filePath)) {
    return { suiteName, passed: 0, failed: 0, total: 0, failedTests: [], error: 'Result file not found' };
  }
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const passed = data.numPassedTests || 0;
    const failed = data.numFailedTests || 0;
    const total = data.numTotalTests || 0;
    const failedTests = [];
    
    if (data.testResults) {
      data.testResults.forEach(suite => {
        if (suite.assertionResults) {
          suite.assertionResults.forEach(test => {
            if (test.status === 'failed') {
              failedTests.push(test.title);
            }
          });
        }
      });
    }

    return { suiteName, passed, failed, total, failedTests };
  } catch (err) {
    return { suiteName, passed: 0, failed: 0, total: 0, failedTests: [], error: 'Error parsing result file' };
  }
};

const results = [
  parseResult(seleniumResultPath, 'Web E2E (Selenium)'),
  parseResult(appiumResultPath, 'Mobile E2E (Appium)'),
  parseResult(dastResultPath, 'Security (DAST)'),
];

let html = `
<!DOCTYPE html>
<html>
<head>
<title>Collabroom Test Report</title>
<style>
  body { font-family: sans-serif; padding: 20px; }
  h1 { color: #333; }
  .suite { border: 1px solid #ccc; padding: 15px; margin-bottom: 15px; border-radius: 5px; }
  .suite h2 { margin-top: 0; }
  .pass { color: green; }
  .fail { color: red; }
  .error { color: orange; }
</style>
</head>
<body>
<h1>Collabroom Final Test Report</h1>
`;

results.forEach(res => {
  html += `<div class="suite">
    <h2>${res.suiteName}</h2>`;
  
  if (res.error) {
    html += `<p class="error">${res.error}</p>`;
  } else {
    html += `<p>Total: ${res.total} | <span class="pass">Passed: ${res.passed}</span> | <span class="fail">Failed: ${res.failed}</span></p>`;
    if (res.failedTests.length > 0) {
      html += `<ul>`;
      res.failedTests.forEach(test => {
        html += `<li class="fail">${test}</li>`;
      });
      html += `</ul>`;
    }
  }
  html += `</div>`;
});

html += `</body></html>`;

fs.writeFileSync(path.join(reportsDir, 'final-report.html'), html);
console.log('Report generated at reports/final-report.html');
