// cypress/helpers/numberHelper.js

export const normalizeNumber = (value) => {
  return Number(String(value).replace(/[₹,%\s,]/g, ""));
};

export const roundNumber = (value, decimals = 2) => {
  return Number(Number(value).toFixed(decimals));
};

/**
 * Generate random integer between min and max (inclusive)
 */
export const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate random float with fixed step
 * Example: randomStep(5, 20, 0.25)
 */
export const randomStep = (min, max, step) => {
  const steps = Math.round((max - min) / step);
  const randomStepIndex = randomInt(0, steps);
  return Number((min + randomStepIndex * step).toFixed(2));
};

/**
 * Loan Principal in Lakhs (0L – 200L)
 */
export const generatePrincipalLakh = () => {
  return randomInt(0, 200);
};

/**
 * Interest Rate (5% – 20%) with 0.25 gap
 */
export const generateInterestRate = () => {
  return randomStep(5, 20, 0.25);
};

/**
 * Loan Tenure in Years (0 – 30) with 0.5 step
 */
export const generateLoanTenure = () => {
  return randomStep(0, 30, 0.5);
};