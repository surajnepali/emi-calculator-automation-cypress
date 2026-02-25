/// <reference types="cypress" />

import { emiCalculatorPage } from "../pages";

let principal = 35;
let annualRate = "6.5";
let tenure = "6.5";
let tenureType = "years";

describe("Home Loan EMI Calculator", () => {
  beforeEach(() => {
  cy.intercept('GET', /googleads|doubleclick|googlesyndication/, {
    statusCode: 204,
    body: '',
  });

  cy.visit('/');
});

  it("Update Home Loan Amount, Interest Rate and Loan Tenure using slider", () => {
    emiCalculatorPage.moveLoanAmountSlider(`${principal}`);
    emiCalculatorPage.moveInterestRateSlider(annualRate);
    emiCalculatorPage.moveLoanTenureSlider(tenure, tenureType);

    emiCalculatorPage.validateEmiPaymentSummary(`${principal * 100000}`, annualRate, tenure, tenureType);
    cy.wait(2500);
    emiCalculatorPage.verifyHighchartPoints();
});
});
