describe("template spec", () => {
  const exampleUser = {
    uid: "ssuvu5cwrMRjsNY5MeZpLWkeeit1",
    email: "cloneg2001@gmail.com",
    avatar: "https://lh3.googleusercontent.com/a/ACg8ocL88x_4EPP-mXwPI36_Zai2t7Ky3ZWF1HZrSEcjVnPc=s96-c",
    fullName: "1410 Conan"
  };

  it("Login with no bearer", () => {
    cy.visit("http://localhost:5173");
    cy.request({
      method: "POST",
      url: "http://localhost:9000/api/users/auth",
      body: exampleUser,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });

    cy.visit("/");
    cy.url().should("eq", "http://localhost:5173/auth/login");
  });
});
