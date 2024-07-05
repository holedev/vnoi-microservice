import LinearWithValueLabel from "./index"; // Adjust path if needed

describe("LinearWithValueLabel", () => {
  it("Renders the progress bar and label correctly", () => {
    const initialProgress = 50;

    cy.mount(<LinearWithValueLabel progress={initialProgress} />);

    cy.get("[role='progressbar']").should("exist").and("have.attr", "aria-valuenow", initialProgress);
    cy.contains(`${initialProgress}%`).should("be.visible");
  });

  it("Updates the progress bar and label when the progress prop changes", () => {
    const initialProgress = 25;
    const updatedProgress = 75;

    cy.mount(<LinearWithValueLabel progress={initialProgress} />);

    cy.get("[role='progressbar']").should("have.attr", "aria-valuenow", initialProgress);
    cy.contains(`${initialProgress}%`).should("be.visible");

    cy.mount(<LinearWithValueLabel progress={updatedProgress} />);

    cy.get("[role='progressbar']").should("have.attr", "aria-valuenow", updatedProgress);
    cy.contains(`${updatedProgress}%`).should("be.visible");
  });

  it("Handles extreme values (0% and 100%)", () => {
    cy.mount(<LinearWithValueLabel progress={0} />);
    cy.get("[role='progressbar']").should("have.attr", "aria-valuenow", 0);
    cy.contains("0%").should("be.visible");

    cy.mount(<LinearWithValueLabel progress={100} />);
    cy.get("[role='progressbar']").should("have.attr", "aria-valuenow", 100);
    cy.contains("100%").should("be.visible");
  });

  it("Handles negative values", () => {
    cy.mount(<LinearWithValueLabel progress={-1} />);
    cy.get("[role='progressbar']").should("have.attr", "aria-valuenow", 0);
    cy.contains("0%").should("be.visible");
  });
});
