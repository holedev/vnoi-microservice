import Question from "./index";

describe("<Question />", () => {
  it("renders", () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Question />);
  });
});
