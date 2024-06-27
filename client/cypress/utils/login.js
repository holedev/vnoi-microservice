import { cookies } from "~/utils/cookies";

export const loginAsLecturer = () => {
  const _USER_LECTURER = {
    uid: "USjGxzyNjNU4HXqo8HE9BN6wdVp1",
    email: "2051052051ho@ou.edu.vn",
    avatar: "https://lh3.googleusercontent.com/a/ACg8ocIZQMgpaFwxypDcHC7r9yysh-crYwLJQQc5Uz157rYJjQ=s96-c",
    fullName: "Hồ Phan Lê"
  };

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
  });
};
