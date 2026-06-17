const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function generateReport() {
  const reportJsonPath = path.join(__dirname, '../reports/E2E_Report.json');
  if (!fs.existsSync(reportJsonPath)) {
    console.warn(`Report JSON not found at ${reportJsonPath}. Tests may not have run or failed entirely.`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(reportJsonPath, 'utf8'));
  const workbook = new ExcelJS.Workbook();
  const summarySheet = workbook.addWorksheet('Summary');
  const testCasesSheet = workbook.addWorksheet('Test Cases');
  const failedTestsSheet = workbook.addWorksheet('Failed Tests');
  const logsSheet = workbook.addWorksheet('Execution Logs');
  
  // Style config
  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6B4EFF' } },
    alignment: { horizontal: 'center' }
  };

  // Sheet 1: Summary
  summarySheet.columns = [
    { header: 'Execution Date', key: 'date', width: 25 },
    { header: 'Environment', key: 'env', width: 20 },
    { header: 'Total Tests', key: 'total', width: 15 },
    { header: 'Passed', key: 'passed', width: 15 },
    { header: 'Failed', key: 'failed', width: 15 },
    { header: 'Skipped', key: 'skipped', width: 15 },
    { header: 'Pass Percentage', key: 'passPercent', width: 15 },
    { header: 'Execution Duration', key: 'duration', width: 20 },
  ];
  summarySheet.getRow(1).eachCell(c => { c.font = headerStyle.font; c.fill = headerStyle.fill; });
  
  summarySheet.addRow({
    date: new Date(data.stats.start).toLocaleString(),
    env: process.env.BASE_URL || 'localhost:3000',
    total: data.stats.tests,
    passed: data.stats.passes,
    failed: data.stats.failures,
    skipped: data.stats.pending,
    passPercent: `${Math.round((data.stats.passes / data.stats.tests) * 100)}%`,
    duration: `${data.stats.duration} ms`
  });

  // Sheet 2: Test Cases
  testCasesSheet.columns = [
    { header: 'Test ID', key: 'id', width: 15 },
    { header: 'Module', key: 'suite', width: 30 },
    { header: 'Scenario Name', key: 'name', width: 50 },
    { header: 'Browser', key: 'browser', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Start Time', key: 'start', width: 20 },
    { header: 'End Time', key: 'end', width: 20 },
    { header: 'Duration', key: 'duration', width: 15 }
  ];
  testCasesSheet.getRow(1).eachCell(c => { c.font = headerStyle.font; c.fill = headerStyle.fill; });

  // Sheet 3: Failed Tests
  failedTestsSheet.columns = [
    { header: 'Test Name', key: 'name', width: 50 },
    { header: 'Failure Reason', key: 'reason', width: 60 },
    { header: 'Screenshot Path', key: 'screenshot', width: 50 },
    { header: 'Browser', key: 'browser', width: 15 },
    { header: 'URL', key: 'url', width: 40 }
  ];
  failedTestsSheet.getRow(1).eachCell(c => { c.font = headerStyle.font; c.fill = headerStyle.fill; });

  // Sheet 4: Execution Logs
  logsSheet.columns = [
    { header: 'Timestamp', key: 'timestamp', width: 25 },
    { header: 'Test Name', key: 'testname', width: 40 },
    { header: 'Step Description', key: 'desc', width: 60 },
    { header: 'Result', key: 'result', width: 15 },
    { header: 'Remarks', key: 'remarks', width: 30 }
  ];
  logsSheet.getRow(1).eachCell(c => { c.font = headerStyle.font; c.fill = headerStyle.fill; });

  const suites = data.results[0].suites || [];
  
  const extractTests = (suite) => {
    suite.tests.forEach(test => {
      const row = testCasesSheet.addRow({
        id: test.title.split(':')[0] || 'N/A',
        suite: suite.title,
        name: test.title,
        browser: process.env.BROWSER || 'chrome',
        status: test.state || (test.pending ? 'pending' : 'unknown'),
        start: 'See Logs', // Mochawesome doesn't provide per-test timestamps in JSON
        end: 'See Logs',
        duration: `${test.duration || 0} ms`
      });
      
      if (test.state === 'failed') {
        failedTestsSheet.addRow({
          name: test.title,
          reason: test.err?.message || 'Unknown',
          screenshot: `reports/failures/${test.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_*.png`,
          browser: process.env.BROWSER || 'chrome',
          url: 'Recorded in JSON'
        });
      }
      
      const statusColor = test.state === 'passed' ? 'FFE8F5E9' : test.state === 'failed' ? 'FFFFEBEE' : 'FFFFF8E1';
      row.eachCell(c => c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusColor } });
    });
    
    if (suite.suites && suite.suites.length > 0) {
      suite.suites.forEach(extractTests);
    }
  };
  
  suites.forEach(extractTests);

  // Populate Sheet 4 from Winston Logs
  const logPath = path.join(__dirname, '../logs/e2e.log');
  if (fs.existsSync(logPath)) {
    const logContent = fs.readFileSync(logPath, 'utf8');
    const lines = logContent.split('\n').filter(l => l.trim() !== '');
    lines.forEach(line => {
      // Very basic parsing for winston plain text log: "[YYYY-MM-DD HH:MM:SS] [LEVEL] Message"
      const match = line.match(/^\[(.*?)\] \[(.*?)\] (.*)$/);
      if (match) {
        logsSheet.addRow({
          timestamp: match[1],
          testname: 'N/A', // Context tracking is advanced, using N/A for now
          desc: match[3],
          result: match[2] === 'ERROR' ? 'FAIL' : 'PASS',
          remarks: match[2]
        });
      }
    });
  }

  const outputPath = path.join(__dirname, '../excel/E2E_Report_Final.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`Excel report generated at ${outputPath}`);
}

generateReport().catch(console.error);
