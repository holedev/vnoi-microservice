import QuillEditor from "./index"; // Adjust the path if needed

describe("QuillEditor", () => {
  it("Allows text input and updates the value", () => {
    const initialValue = "Initial text content";
    const newValue = "Updated text content";
    cy.mount(<QuillEditor value={initialValue} setValue={cy.stub()} />);

    cy.get(".ql-editor").should("exist").should("have.text", initialValue);
    cy.get(".ql-editor p").type(newValue);
    cy.get(".ql-editor").should("contain.text", newValue);
  });

  it("Apply basic formatting", () => {
    cy.mount(<QuillEditor value={""} setValue={cy.stub()} />);

    cy.get(".ql-editor p").type("This is some text");
    cy.get(".ql-editor p").type("{selectall}");
    cy.get(".ql-editor p").get(".ql-bold").click();

    cy.get(".ql-editor strong").should("exist").should("have.text", "This is some text");
  });

  it("Should handle special characters", () => {
    cy.mount(<QuillEditor value={""} setValue={cy.stub()} />);
    const specialCharacters = "Phan Lê Hồ";
    cy.get(".ql-editor p").type(specialCharacters);
    cy.get(".ql-editor").should("contain.text", specialCharacters);
  });
});
