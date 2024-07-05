import VideoStack from "./index.jsx"; // Adjust path if needed

describe("VideoStack", () => {
  const _SRC = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

  it("Loads and plays the HLS video", () => {
    if (Cypress.isBrowser("firefox")) {
      cy.log("Skipping test due to browser compatibility issues with HLS videos");
      return;
    }

    const videoRefStub = {
      current: {
        addEventListener: cy.stub(),
        removeEventListener: cy.stub()
      }
    };

    cy.mount(<VideoStack videoRef={videoRefStub} src={_SRC} onTimeUpdate={() => {}} onLoadedMetadata={() => {}} />);

    cy.get("[data-plyr]").should("exist");
    cy.get("video").should("exist").and("have.attr", "src");

    cy.get(".plyr__time--current").should("exist");
    cy.get("[data-plyr='play']").last().click();
    cy.get("[data-plyr='play']").last().should("not.have.attr", "data-paused");

    cy.wait(3000);

    cy.get("[data-plyr='play']").last().click();
    cy.get("[data-plyr='play']").last().should("not.have.attr", "data-pressed");
  });
});
