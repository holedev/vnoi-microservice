import { cookies } from "~/utils/cookies";

const _USER_LECTURER = {
  uid: "USjGxzyNjNU4HXqo8HE9BN6wdVp1",
  email: "2051052051ho@ou.edu.vn",
  avatar: "https://lh3.googleusercontent.com/a/ACg8ocIZQMgpaFwxypDcHC7r9yysh-crYwLJQQc5Uz157rYJjQ=s96-c",
  fullName: "Hồ Phan Lê"
};

const _USER_NOT_ALLOW = {
  uid: "qLCWSAZNxocfeLpyCQwQ749D0Dw1",
  email: "cloneg2001@gmail.com",
  avatar: "https://lh3.googleusercontent.com/a/ACg8ocLkU8yjRST2sP_A-a7bJWaFOAS8ITnY6wZ00a68-nBazqupHg=s96-c",
  fullName: "1410 Conan"
};

describe("Login", () => {
  beforeEach(() => {
    cy.clearCookies();
  });

  it("Login with no Bearer return 401", { baseUrl: Cypress.env("CYPRESS_BASE_URL") }, () => {
    cy.visit("/");
    cy.url().should("eq", Cypress.env("CYPRESS_BASE_URL") + "/auth/login");

    cy.request({
      method: "POST",
      url: Cypress.env("CYPRESS_API_URL") + "/api/user/auth",
      body: _USER_LECTURER,
      headers: {
        "Content-Type": "application/json"
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });

    cy.visit("/");
    cy.url().should("eq", Cypress.env("CYPRESS_BASE_URL") + "/auth/login");
  });

  it("Login with user not allow return 403", { baseUrl: Cypress.env("CYPRESS_BASE_URL") }, () => {
    cy.visit("/");

    cy.login(_USER_NOT_ALLOW.uid)
      .then((user) => {
        return cy.wrap(user.auth.currentUser.accessToken);
      })
      .as("getUserAccessToken");

    cy.get("@getUserAccessToken")
      .then((accessToken) => {
        cy.request({
          method: "POST",
          url: Cypress.env("CYPRESS_API_URL") + "/api/user/auth",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
          },
          body: _USER_NOT_ALLOW,
          failOnStatusCode: false
        }).then((response) => {
          cy.wrap(response);
        });
      })
      .as("getDataUserLogin");

    cy.get("@getDataUserLogin").then((response) => {
      expect(response.status).to.eq(403);
      expect(response.body).has.property("message", "Please use email of OU !!!");
    });
  });

  it("Login LECTURER", { baseUrl: Cypress.env("CYPRESS_BASE_URL") }, () => {
    cy.visit("/");

    cy.login(_USER_LECTURER.uid)
      .then((user) => {
        return cy.wrap(user.auth.currentUser.accessToken);
      })
      .as("getUserAccessToken");

    cy.get("@getUserAccessToken")
      .then((accessToken) => {
        cy.request({
          method: "POST",
          url: Cypress.env("CYPRESS_API_URL") + "/api/user/auth",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
          },
          body: _USER_LECTURER
        }).then((response) => {
          cy.wrap(response);
        });
      })
      .as("getDataUserLogin");

    cy.get("@getDataUserLogin").then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).has.property("_id");
      expect(response.body.data).has.property("email", _USER_LECTURER.email);
      cookies.set("user", response.body.data);

      cy.visit("/");
      cy.url().should("eq", Cypress.env("CYPRESS_BASE_URL") + "/competition");

      cy.get("[aria-label='toggle-sidebar']").click({ force: true });
      cy.contains("Dashboard").should("be.visible");

      cy.contains(_USER_LECTURER.fullName).should("be.visible").click();
      cy.url().should("include", Cypress.env("CYPRESS_BASE_URL") + "/profile/");

      cy.get("input[aria-label='user-email']").should("be.visible").should("have.value", _USER_LECTURER.email);
      cy.get("input[aria-label='user-role']").should("be.visible").should("have.value", "LECTURER");
    });
  });
});
