import { cookies } from "~/utils/cookies";

export const logout = () => {
  cy.logout();
  cookies.remove("user");
  cy.clearCookies();
  cy.clearLocalStorage();
};
