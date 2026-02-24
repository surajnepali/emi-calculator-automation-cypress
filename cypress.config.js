const { defineConfig } = require("cypress");

module.exports = defineConfig({
  allowCypressEnv: false,
  defaultCommandTimeout: 10000,
  viewportHeight: 1080,
  viewportWidth: 1980,
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'reports',
    overwrite: false,
    html: true,
    json: true
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      require('cypress-mochawesome-reporter/plugin')(on);
    },
  },
});
