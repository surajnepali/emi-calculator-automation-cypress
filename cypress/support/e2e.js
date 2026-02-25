// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

Cypress.on('uncaught:exception', (err, runnable) => {
  // Log but do not fail the test for non-critical app errors
  cy.log(`Uncaught exception (suppressed): ${err.message}`);
  return false;
});

Cypress.on('uncaught:exception', (err) => {
  if (
    err.message === 'Script error.' ||
    err.message.includes('adsbygoogle')
  ) {
    return false;
  }
});