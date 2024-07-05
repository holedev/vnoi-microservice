import SearchDebounce from "./index";
import { BrowserRouter as Router } from "react-router-dom";

describe("SearchDebounce", () => {
  it("Debounces the search", () => {
    const searchFnStub = cy.stub();

    cy.mount(
      <Router>
        <SearchDebounce fn={searchFnStub} setSearch={() => {}} />
      </Router>
    );

    cy.get("input[type='search']").click();
    cy.get("input[type='search']").focus();
    cy.get("input[type='search']").should("be.visible").invoke("val", "hello").trigger("change");

    cy.wrap(searchFnStub).should("not.be.called");
    cy.wait(1000);
    cy.wrap(searchFnStub).should("be.called");
  });

  it("Call search when clear", () => {
    const searchFnStub = cy.stub();

    cy.mount(
      <Router>
        <SearchDebounce fn={searchFnStub} setSearch={() => {}} />
      </Router>
    );

    cy.get("input[type='search']").click();
    cy.get("input[type='search']").focus();
    cy.get("input[type='search']").should("be.visible").invoke("val", "hello").trigger("change");
    cy.get("input[type='search']").clear();
    cy.wrap(searchFnStub).should("be.called");
  });
});
