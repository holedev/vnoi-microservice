import CountdownTimer from "./index";

describe("CountdownTimer", () => {
  it("should render with full props", () => {
    cy.mount(<CountdownTimer timeEnd={new Date()} />);
    cy.get("span").should("have.class", "countdown-timer").should("have.visible");
  });

  it("not render with no props", () => {
    cy.mount(<CountdownTimer />);
    cy.get("span").not("have.visible");
  });
});
