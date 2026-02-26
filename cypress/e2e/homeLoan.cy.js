/// <reference types="cypress" />

import { emiCalculatorPage } from "../pages";
import { generateInterestRate, generateLoanTenure, generatePrincipalLakh } from "../support/helper";

let tenureType = "years";

describe("Home Loan EMI Calculator", () => {
  before(() => {
    // Clean downloads folder before test run
    cy.task("deleteDownloadsFolder");
  });

  beforeEach(() => {
    cy.intercept("GET", /googleads|doubleclick|googlesyndication/, {
      statusCode: 204,
      body: "",
    });

    cy.visit("/");
  });

  it("Verify updating Home Loan Amount, Interest Rate, and Loan Tenure using sliders", () => {

    const principal = generatePrincipalLakh();   // e.g. 125
    const rate = generateInterestRate();          // e.g. 6.75
    const tenure = generateLoanTenure();     // e.g. 22.5

    emiCalculatorPage.moveLoanAmountSlider(`${principal}`);
    emiCalculatorPage.moveInterestRateSlider(`${rate}`);
    emiCalculatorPage.moveLoanTenureSlider(`${tenure}`, tenureType);
  });

  it("Verify EMI calculation by capturing and validating against formula-based recalculation", () => {

    const principal = generatePrincipalLakh();   // e.g. 125
    const rate = generateInterestRate();          // e.g. 6.75
    const tenure = generateLoanTenure();     // e.g. 22.5

    emiCalculatorPage.fillEmiFields(`${principal * 100000}`, rate, tenure, tenureType);

    emiCalculatorPage.validateEmiPaymentSummary(
      `${principal * 100000}`,
      rate,
      tenure,
      tenureType,
    );
  });

  it("Validate year-wise values in Chart match corresponding Table data", () => {

    const principal = generatePrincipalLakh();   // e.g. 125
    const rate = generateInterestRate();          // e.g. 6.75
    const tenure = generateLoanTenure();     // e.g. 22.5

    emiCalculatorPage.fillEmiFields(`${principal * 100000}`, rate, tenure, tenureType);

    cy.wait(1500);
    emiCalculatorPage.verifyHighchartPoints();
  });

  it("Verify Excel file download and perform validation checks", () => {
    const downloadsFolder = Cypress.config("downloadsFolder");

    const principal = generatePrincipalLakh();   // e.g. 125
    const rate = generateInterestRate();          // e.g. 6.75
    const tenure = generateLoanTenure();     // e.g. 22.5

    emiCalculatorPage.fillEmiFields(`${principal * 100000}`, rate, tenure, tenureType);

    cy.wait(1500);

    // 1️⃣ Click Download Excel
    cy.contains("a", "Download Excel").click();

    // 2️⃣ Wait for download
    cy.wait(1500);

    // 3️⃣ Get latest Excel file
    cy.task("getLatestFile", downloadsFolder).then((fileName) => {
      expect(fileName).to.match(/\.xlsx$/);

      const filePath = `${downloadsFolder}/${fileName}`;

      // 4️⃣ Read Excel file
      cy.task("readXlsxFile", {
        filePath,
        sheetName: "Copyright © EMICalculator.net",
      }).then((excelRows) => {

        // 5️⃣ Convert Excel rows into key–value map
        const excelData = {};

        excelRows.forEach((row) => {
          const values = Object.values(row);

          if (values.length < 2) return;

          const rawKey = values[0];
          const rawValue = values[1];

          // Skip empty rows
          if (rawKey === undefined || rawValue === undefined) return;

          const key = String(rawKey).trim();
          const value = rawValue;

          excelData[key] = value;
        });

        // 6️⃣ Validate UI vs Excel
        emiCalculatorPage.validateHomeLoanSummary(excelData);
      });
    });
  });
});
