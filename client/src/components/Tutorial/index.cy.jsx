import Tutorial from "./index";

describe("Tutorial", () => {
  const steps = [
    {
      content: <h2>Welcome to problem page! Let see what we can do! 😁</h2>,
      placement: "center",
      target: "body"
    },
    {
      content: "This is the problem's TITLE!",
      placement: "center",
      target: "body"
    },
    {
      content: "This is the problem's LEVEL! We have EASY, MEDIUM, HARD! The default is EASY!",
      placement: "center",
      target: "body"
    }
  ];

  it("Renders the tutorial and allows navigation", () => {
    cy.mount(<Tutorial setRun={() => {}} steps={steps} run={true} />);

    cy.contains(/Welcome to problem page/).should("be.visible");
    cy.get("button[aria-label='Next']").click();

    cy.contains(/This is the problem's TITLE!/).should("be.visible");
    cy.get("button[aria-label='Skip']").click();

    cy.get(".react-joyride__overlay").should("not.exist");
  });

  it("Not render the tutorial when run is false", () => {
    cy.mount(<Tutorial setRun={() => {}} steps={steps} run={false} />);

    cy.get(".react-joyride__overlay").should("not.exist");
  });

  it("Calls setRun(false) when the tour is finished", () => {
    const setRunStub = cy.stub();

    cy.mount(<Tutorial setRun={setRunStub} steps={steps} run={true} />);

    cy.get("button[aria-label='Next']").click();
    cy.get("button[aria-label='Next']").click();
    cy.get("button[aria-label='Last']").click();

    cy.wrap(setRunStub).should("have.been.calledWith", false);
  });

  it("Handles the 'close' action correctly", () => {
    const setRunStub = cy.stub();

    cy.mount(<Tutorial setRun={setRunStub} steps={steps} run={true} />);

    cy.get("button[aria-label='Close']").click();

    cy.wrap(setRunStub).should("have.been.calledOnceWith", false);
  });
});
