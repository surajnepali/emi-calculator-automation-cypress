/// <reference types="cypress" />

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

  verifyLoanAmountLabel() {
    cy.get(this.loanAmountLabel).should("have.text", "Home Loan Amount");
  }

  verifyInterestRateLabel() {
    cy.get(this.interestRateLabel).should("have.text", "Interest Rate");
  }

  verifyLoanTenureLabel() {
    cy.get(this.loanTenureLabel).should("have.text", "Loan Tenure");
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
          expect(text, "EMI text should not be empty").to.not.be.empty;

          const numericValue = Number(text.replace(/[^\d]/g, ""));
          cy.log("NumericValue: " + numericValue);
          expect(numericValue).to.eq(emi);
        });
    });
    
    cy.calculateTotalInterest(principal, annualRate, tenure, tenureType).then((totalInterest) => {
      cy.get(this.emiTotalInterest)
        .should("be.visible")
        .then(($el) => {
          const text = $el.text();
          expect(text, "EMI text should not be empty").to.not.be.empty;

          const numericValue = Number(text.replace(/[^\d]/g, ""));
          cy.log("NumericValue: " + numericValue);
          expect(numericValue).to.eq(totalInterest);
        });
    });
    
    cy.calculateTotalPayment(principal, annualRate, tenure, tenureType).then((totalPayment) => {
      cy.get(this.emiTotalAmount)
        .should("be.visible")
        .then(($el) => {
          const text = $el.text();
          expect(text, "EMI text should not be empty").to.not.be.empty;

          const numericValue = Number(text.replace(/[^\d]/g, ""));
          cy.log("NumericValue: " + numericValue);
          expect(numericValue).to.eq(totalPayment);
        });
    });
  }
  
}

export { EmiCalculatorPage };
