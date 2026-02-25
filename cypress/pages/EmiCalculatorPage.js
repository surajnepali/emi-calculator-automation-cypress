/// <reference types="cypress" />

import { isVisible } from "../support/assertions";
import { normalizeNumber, roundNumber } from "../support/helper";

const tooltipData = [];

class EmiCalculatorPage {
  pageTitle = ".page-header h1";
  loanAmountLabel = "label[for='loanamount']";
  loanAmountField = "input#loanamount";
  loanAmountSlider = "#loanamountslider";
  interestRateLabel = "label[for='loaninterest']";
  interestRateField = "input#loaninterest";
  interestRateSlider = "#loaninterestslider";
  loanTenureLabel = "label[for='loanterm']";
  loanTenureField = "input#loanterm";
  loanTenureSlider = "#loantermslider";
  loadEmiAmount = "#emiamount span";
  emiTotalInterest = "#emitotalinterest span";
  emiTotalAmount = "#emitotalamount span";

  highChartsContainer = "#emibarchart div.highcharts-container";
  highChartsMarker = "g.highcharts-markers.highcharts-tracker";
  highChartsPoint = "path.highcharts-point";

  emiPaymentTable = "#emipaymenttable";

  verifyLoanAmountLabel() {
    cy.get(this.loanAmountLabel).should("have.text", "Home Loan Amount");
  }

  verifyInterestRateLabel() {
    cy.get(this.interestRateLabel).should("have.text", "Interest Rate");
  }

  verifyLoanTenureLabel() {
    cy.get(this.loanTenureLabel).should("have.text", "Loan Tenure");
  }

  enterLoanAmount(amount){
    isVisible(this.loanAmountField).clear().type(amount);
  }

  enterInterestRate(rate){
    isVisible(this.interestRateField).clear().type(rate);
  }

  enterLoanTenure(time, tenureType){
    let tenure = time;
    if(tenureType.includes("months")){
      tenure = time * 12;
    }
    isVisible(this.loanTenureField).clear().type(tenure);
  }

  fillEmiFields(amount, rate, time, tenureType){
    this.enterLoanAmount(amount);
    this.enterInterestRate(rate);
    this.enterLoanTenure(time, tenureType);
    cy.get(this.loadEmiAmount).click();
  }

  moveLoanAmountSlider(amount) {
    this.verifyLoanAmountLabel();
    cy.setSliderValue(this.loanAmountSlider, amount, "loanAmount").then(() => {
      cy.get(this.loanAmountField)
        .invoke("val")
        .then((val) => {
          const numericValue = val.replace(/,/g, "");
          expect(numericValue).to.eq(`${amount * 100000}`);
        });
    });
  }

  moveInterestRateSlider(rate) {
    this.verifyInterestRateLabel();
    cy.setSliderValue(this.interestRateSlider, rate, "interestRate").then(
      () => {
        cy.get(this.interestRateField)
          .invoke("val")
          .then((val) => {
            expect(val).to.eq(rate);
          });
      },
    );
  }

  moveLoanTenureSlider(value, yearsOrMonths) {
    this.verifyLoanTenureLabel();

    let loanTenureValue = "loanTenureInYears";

    if (!yearsOrMonths.includes("year")) {
      loanTenureValue = "loanTenureInMonths";
    }

    cy.setSliderValue(this.loanTenureSlider, value, loanTenureValue).then(
      () => {
        cy.get(this.loanTenureField)
          .invoke("val")
          .then((val) => {
            expect(val).to.eq(value);
          });
      },
    );
  }

  validateEmiPaymentSummary(principal, annualRate, tenure, tenureType) {
    cy.calculateEMI(principal, annualRate, tenure, tenureType).then((emi) => {
      cy.log("EMI: " + emi);
      cy.get(this.loadEmiAmount)
        .should("be.visible")
        .then(($el) => {
          const text = $el.text();
          const numericValue = Number(text.replace(/[^\d]/g, ""));
          expect(numericValue).to.eq(emi);
        });
    });

    cy.calculateTotalInterest(principal, annualRate, tenure, tenureType).then(
      (totalInterest) => {
        cy.get(this.emiTotalInterest)
          .should("be.visible")
          .then(($el) => {
            const text = $el.text();
            const numericValue = Number(text.replace(/[^\d]/g, ""));
            expect(numericValue).to.eq(totalInterest);
          });
      },
    );

    cy.calculateTotalPayment(principal, annualRate, tenure, tenureType).then(
      (totalPayment) => {
        cy.get(this.emiTotalAmount)
          .should("be.visible")
          .then(($el) => {
            const text = $el.text();
            const numericValue = Number(text.replace(/[^\d]/g, ""));
            expect(numericValue).to.eq(totalPayment);
          });
      },
    );
  }

  verifyHighchartPoints() {
    isVisible(this.highChartsContainer)
      .within(() => {
        cy.window().then((win) => {
          const targetChart = win.Highcharts.charts.find(
            (chart) =>
              chart !== undefined &&
              chart.series.some((s) => s.name === "Balance"),
          );

          if (!targetChart) {
            throw new Error(`No chart found with Balance series`);
          }

          const balanceSeries = targetChart.series.find(
            (s) => s.name === "Balance",
          );

          cy.wrap(balanceSeries.data).each((point, index) => {
            cy.wrap(point).then((p) => {
              p.onMouseOver();
            });

            cy.get("g.highcharts-tooltip")
              .invoke("text")
              .then((text) => {
                const year = text.match(/Year\s*:\s*(\d+)/)?.[1];
                const balance = text
                  .match(/Balance\s*:\s*([\₹\s\d,]+)/)?.[1]
                  ?.trim();
                const loanPaid = text.match(
                  /Loan Paid To Date\s*:\s*([\d.]+%)/,
                )?.[1];

                tooltipData.push({ year, balance, loanPaid });
              });
          });
        });
      })
      .then(() => {
        cy.log("Full Tooltip Data: " + JSON.stringify(tooltipData, null, 2));

        // Validate against table rows
        cy.get("table tbody tr.yearlypaymentdetails").each(($row, index) => {
          if (index < tooltipData.length) {
            const expected = tooltipData[index];

            // Get each cell value from the table row
            cy.wrap($row)
              .find("td")
              .then(($cells) => {
                const year = $cells.eq(0).text().trim();
                const balance = $cells.eq(4).text().trim(); // Balance column
                const loanPaid = $cells.eq(5).text().trim(); // Loan Paid To Date column

                cy.log(`Validating Row ${index + 1} - Year: ${year}`);

                // Assert Year
                expect(year).to.include(expected.year);

                // Assert Balance (normalize spaces and ₹ symbol)
                const normalizeAmount = (val) =>
                  val
                    .replace(/\s+/g, "")
                    .replace("₹", "")
                    .replace(/,/g, "")
                    .trim();
                expect(normalizeAmount(balance)).to.equal(
                  normalizeAmount(expected.balance),
                );

                // Assert Loan Paid To Date
                expect(loanPaid).to.include(expected.loanPaid);

                cy.log(
                  `✅ Row ${index + 1} Passed - Year: ${year}, Balance: ${balance}, Loan Paid: ${loanPaid}`,
                );
              });
          }
        });
      });
  }

  validateHomeLoanSummary(excelData) {
    cy.get(this.loanAmountField)
      .invoke("val")
      .then((uiValue) => {
        expect(normalizeNumber(uiValue))
          .to.eq(normalizeNumber(excelData["Home Loan Amount"]));
      });

    cy.get(this.interestRateField)
      .invoke("val")
      .then((uiValue) => {
        expect(roundNumber(uiValue))
          .to.eq(roundNumber(excelData["Interest Rate (%)"]));
      });

    cy.get(this.loanTenureField)
      .invoke("val")
      .then((uiValue) => {
        expect(Number(uiValue) * 12)
          .to.eq(Number(excelData["Loan Tenure (months)"]));
      });

    cy.get(this.loadEmiAmount)
      .invoke("text")
      .then((uiValue) => {
        expect(normalizeNumber(uiValue))
          .to.eq(normalizeNumber(excelData["Loan EMI"]));
      });

    cy.get(this.emiTotalInterest)
      .invoke("text")
      .then((uiValue) => {
        expect(normalizeNumber(uiValue))
          .to.eq(normalizeNumber(excelData["Total Interest Payable"]));
      });

    cy.get(this.emiTotalAmount)
      .invoke("text")
      .then((uiValue) => {
        expect(normalizeNumber(uiValue))
          .to.eq(
            normalizeNumber(
              excelData["Total Payment (Principal + Interest)"]
            )
          );
      });
  }
}

export { EmiCalculatorPage };
