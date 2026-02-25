// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("calculateEMI", (principal, annualRate, tenure, tenureType) => {
  const monthlyRate = annualRate / 12 / 100;
  let tenureMonths = tenure * 12;
  if(tenureType.includes("month")){
      tenureMonths = tenure;
  }

  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  return Math.round(emi);
});

Cypress.Commands.add(
  "calculateTotalPayment",
  (principal, annualRate, tenure, tenureType) => {
    const monthlyRate = annualRate / 12 / 100;
    let tenureMonths = tenure * 12;

    if (tenureType.includes("month")) {
      tenureMonths = tenure;
    }

    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);

    const totalPayment = emi * tenureMonths;

    return Math.round(totalPayment);
  }
);

Cypress.Commands.add(
  "calculateTotalInterest",
  (principal, annualRate, tenure, tenureType) => {
    const monthlyRate = annualRate / 12 / 100;
    let tenureMonths = tenure * 12;

    if (tenureType.includes("month")) {
      tenureMonths = tenure;
    }

    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);

    const totalPayment = emi * tenureMonths;
    const totalInterest = totalPayment - principal;

    return Math.round(totalInterest);
  }
);

Cypress.Commands.add(
  "setSliderValue",
  (sliderSelector, value, sliderType) => {
    let min, max;

    switch (sliderType) {
      case "loanAmount":
        min = 0;
        max = 200; // Lakhs
        break;

      case "interestRate":
        min = 5;   // %
        max = 20;
        break;

      case "loanTenureInYears":
        min = 0;
        max = 30;  // Years
        break;

      case "loanTenureInMonths":
        min = 0;
        max = 360;  // Months
        break;

      default:
        throw new Error(`Unknown slider type: ${sliderType}`);
    }

    cy.get(sliderSelector).then(($slider) => {
      const sliderWidth = $slider.width();

      // normalize value between 0–1
      const percentage = (value - min) / (max - min);
      const clickX = sliderWidth * percentage;

      cy.wrap($slider).click(clickX, 5);
    });
  }
);
