import CountdownTimer from "./index";

describe("Component CountdownTimer", () => {
  it("renders", () => {
    cy.mount(<CountdownTimer timeEnd={new Date()} />);
    cy.get("span").should("have.class", "countdown-timer");
  });
});
