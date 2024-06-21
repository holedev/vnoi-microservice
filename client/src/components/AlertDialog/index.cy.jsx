import AlertDialog, { _DEFAULT_CONTENT, _DEFAULT_TITLE } from "./index";

describe("AlertDialog", () => {
  it("should not be visible when open is false", () => {
    cy.mount(<AlertDialog open={false} />);
    cy.get('[role="dialog"]').should("not.exist");
  });

  it("should be visible when open is true", () => {
    cy.mount(<AlertDialog open={true} title='Hello' content='This is a test' />);
    cy.get('[role="dialog"]').should("be.visible");
    cy.contains("Hello").should("be.visible");
    cy.contains("This is a test").should("be.visible");
  });

  it("should have default title", () => {
    cy.mount(<AlertDialog open={true} content='demo123' />);
    cy.contains(_DEFAULT_TITLE).should("be.visible");
  });

  it("should have default content", () => {
    cy.mount(<AlertDialog open={true} />);
    cy.contains(_DEFAULT_CONTENT).should("be.visible");
  });

  it("should call setOpen when Cancel button is clicked", () => {
    const setOpen = cy.stub().as("setOpenStub");
    cy.mount(<AlertDialog open={true} content='demo123' setOpen={setOpen} />);
    cy.contains("Cancel").click();
    cy.get("@setOpenStub").should("have.been.calledOnce");
  });

  it("should call handleAction and handleClose when Ok button is clicked", () => {
    const handleClose = cy.stub().as("handleCloseStub");
    const handleAction = cy.stub().as("handleActionStub");
    cy.mount(<AlertDialog open={true} setOpen={handleClose} handleAction={handleAction} />);
    cy.contains("Ok").click();
    cy.get("@handleCloseStub").should("have.been.calledOnce");
    cy.get("@handleActionStub").should("have.been.calledOnce");
  });

  it("should close when clicking outside the dialog or pressing Esc", () => {
    const handleClose = cy.stub().as("handleCloseStub");
    cy.mount(<AlertDialog open={true} setOpen={handleClose} />);

    // Click outside
    cy.get("body").click(0, 0);
    cy.get("@handleCloseStub").should("have.been.calledOnce");

    // Press Esc
    cy.mount(<AlertDialog open={true} setOpen={handleClose} />);
    cy.get('[role="presentation"]').first().type("{esc}");
    cy.get("@handleCloseStub").should("have.been.calledTwice");
  });
});
