module.exports = {
  timeout: 60000,
  retries: 2,
  // parallel: true, // Uncomment to run tests in parallel (can cause flakiness locally)
  // jobs: 4,
  reporter: 'mochawesome',
  'reporter-option': [
    'reportDir=reports',
    'reportFilename=E2E_Report',
    'overwrite=true',
    'html=true',
    'json=true'
  ]
};
