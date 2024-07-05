import { loginAsLecturer } from "../utils/login.js";
import { logout } from "../utils/logout.js";

describe("Problem", () => {
  const _PROBLEM = {
    title: "Two Sum",
    description: `Write a function that returns the sum of two numbers. Use **cin** to read two numbers from the console and use **cout** to print the result to the console.

---
Example:
| Input | Output | Explain |
|----------|----------|----------|
| 1 5   | 6  | 1 + 5 = 6 |`
  };

  beforeEach(() => {
    loginAsLecturer();
  });

  afterEach(() => {
    logout();
  });

  it("Create problem", { baseUrl: Cypress.env("CYPRESS_BASE_URL") }, () => {
    cy.visit("/lecturer/dashboard/problems");

    cy.get("button").contains("New Problem").should("exist").click();

    cy.get("input#title").should("exist").type(_PROBLEM.title);
    cy.get("textarea#editor").first().should("exist").type(_PROBLEM.description);
    cy.get('input#upload-btn-hidden[type="file"]').selectFile("./cypress/fixtures/problems/two-sum/solution.txt", {
      force: true
    });

    cy.get('input#testcase-with-file-hidden[type="file"]').selectFile(
      "./cypress/fixtures/problems/two-sum/testcase.txt",
      { force: true }
    );
    cy.get("#action-alway-open").click();
    cy.get("button[type='submit']").click();

    cy.location("pathname").should("eq", "/lecturer/dashboard/problems");

    cy.wait(5000);
    cy.get("[aria-label='status-problem']").each(($icon) => {
      cy.wrap($icon).find("svg").should("have.attr", "aria-label", "done-icon");
    });
  });

  it("Run problem", { baseUrl: Cypress.env("CYPRESS_BASE_URL") }, () => {
    cy.visit("/problems");

    cy.contains(_PROBLEM.title).first().should("exist").click();

    cy.get("h3#title").should("exist").and("have.text", _PROBLEM.title);

    cy.get("input#upload-file-hidden[type='file']").selectFile("./cypress/fixtures/problems/two-sum/solution.txt", {
      force: true
    });

    cy.get("button#btn-console").should("exist").click();
    cy.get("button#btn-run").should("exist").click();
    cy.contains("Pass: 3/3").should("exist");

    cy.get("body").type("{esc}");

    cy.contains("Description").should("exist").and("have.attr", "tabindex", "0").click();
    cy.get("button#btn-submit").should("exist").click();
    cy.contains("Submissions").should("exist").and("have.attr", "tabindex", "0");

    cy.get("[aria-label='row-loading']").should("have.length", 1);
  });

  it("Delete problem", { baseUrl: Cypress.env("CYPRESS_BASE_URL") }, () => {
    cy.visit("/lecturer/dashboard/problems");
    cy.wait(1000);

    let countProblem = 0;
    cy.get("[aria-label='btn-delete']")
      .its("length")
      .then((length) => {
        countProblem = length;
      });

    cy.get("[aria-label='btn-delete']").first().click();
    cy.get("h2").should("exist").and("have.text", "Delete");
    cy.contains("Ok").should("exist").click();

    cy.wait(1000);
    cy.get("[aria-label='btn-delete']")
      .its("length")
      .then((length) => {
        expect(length).to.be.lessThan(countProblem);
      });
  });
});
