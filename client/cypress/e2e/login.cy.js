import { cookies } from "~/utils/cookies";

const studentUser = {
  uid: "56h8MaU8MncTohzf5ajlpoognFh2",
  email: "2051052051ho@ou.edu.vn",
  avatar: "https://lh3.googleusercontent.com/a/ACg8ocL88x_4EPP-mXwPI36_Zai2t7Ky3ZWF1HZrSEcjVnPc=s96-c",
  fullName: "1410 Conan"
};

describe("Login", () => {
  beforeEach(() => {
    cy.clearCookies();
  });

  it.only("Login with no Bearer return 401", { baseUrl: Cypress.env("CYPRESS_BASE_URL") }, () => {
    cy.visit("/");
    cy.url().should("eq", Cypress.env("CYPRESS_BASE_URL") + "/auth/login");

    Cypress.config("baseUrl", Cypress.env("CYPRESS_API_URL"));

    cy.request({
      method: "POST",
      url: Cypress.env("CYPRESS_API_URL") + "/api/user/auth",
      body: studentUser,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });

    Cypress.config("baseUrl", Cypress.env("CYPRESS_BASE_URL"));

    cy.visit("/");
    cy.url().should("eq", Cypress.env("CYPRESS_BASE_URL") + "/auth/login");
  });

  it("Login STUDENT", () => {
    cy.visit("/");

    cy.login(studentUser.uid)
      .then((user) => {
        return cy.wrap(user.auth.currentUser.accessToken);
      })
      .as("getUserAccessToken");

    cy.get("@getUserAccessToken")
      .then((accessToken) => {
        cy.request({
          method: "POST",
          url: Cypress.env("API_URL") + "/api/user/auth",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
          },
          body: studentUser
        }).then((response) => {
          cy.wrap(response);
        });
      })
      .as("getDataUserLogin");

    cy.get("@getDataUserLogin").then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).has.property("_id");
      expect(response.body.data).has.property("email", studentUser.email);
      cookies.set("user", response.body.data);

      cy.visit("/");
      cy.url().should("eq", Cypress.env("BASE_URL") + "/competition");
    });
  });
});
