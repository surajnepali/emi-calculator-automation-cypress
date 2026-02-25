export const isVisible = (locator) => {
  return cy.get(locator).should("be.visible");
};

export const isEnabled = (locator) => {
  return cy.get(locator).should("be.enabled");
};

export const isDisabled = (locator) => {
  return cy.get(locator).should("be.disabled");
};

export const isUnchecked = (locator) => {
  return cy.get(locator).should("not.be.checked");
};

export const isNotExist = (locator) => {
  return cy.get(locator).should("not.exist");
};
