const fs = require('fs');
const ExcelJS = require('exceljs');
const path = require('path');

const resultsFile = path.join(__dirname, 'jest-results.json');
const outputFile = path.join(__dirname, 'reports/E2E_Test_Report.xlsx');

async function generateExcel() {
  if (!fs.existsSync(resultsFile)) {
    console.log('No jest-results.json found. Skipping Excel generation.');
    return;
  }

  const rawData = fs.readFileSync(resultsFile, 'utf8');
  let data;
  try {
    data = JSON.parse(rawData);
  } catch (e) {
    console.log('Error parsing jest-results.json', e);
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const summarySheet = workbook.addWorksheet('Summary');
  const detailsSheet = workbook.addWorksheet('Test Details');

  // Summary Sheet
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 25 },
    { header: 'Value', key: 'value', width: 15 },
  ];

  summarySheet.addRow({ metric: 'Total Tests', value: data.numTotalTests });
  summarySheet.addRow({ metric: 'Passed', value: data.numPassedTests });
  summarySheet.addRow({ metric: 'Failed', value: data.numFailedTests });
  summarySheet.addRow({ metric: 'Pending', value: data.numPendingTests });
  summarySheet.addRow({ metric: 'Start Time', value: new Date(data.startTime).toLocaleString() });
  summarySheet.addRow({ metric: 'End Time', value: new Date().toLocaleString() });

  // Details Sheet
  detailsSheet.columns = [
    { header: 'Suite', key: 'suite', width: 30 },
    { header: 'Test Name', key: 'name', width: 50 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Duration (ms)', key: 'duration', width: 15 },
    { header: 'Failure Messages', key: 'errors', width: 50 },
  ];

  if (data.testResults) {
    data.testResults.forEach((suite) => {
      const suiteName = suite.name.split(/[\/\\]/).pop();
      if (suite.assertionResults) {
        suite.assertionResults.forEach((test) => {
          detailsSheet.addRow({
            suite: suiteName,
            name: test.title,
            status: test.status,
            duration: test.duration || 0,
            errors: test.failureMessages ? test.failureMessages.join('\n') : ''
          });
        });
      }
    });
  }

  // Ensure reports dir exists
  const reportsDir = path.dirname(outputFile);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  await workbook.xlsx.writeFile(outputFile);
  console.log(`Excel report generated successfully at ${outputFile}`);
}

generateExcel().catch(console.error);
