import LoadingSkeleton from "./index";
import { LoadingProvider } from "~/store/LoadingContext";
import styles from "./LoadingContext.module.css";

describe("LoadingSkeleton", () => {
  it("Renders the loading skeleton when loading is true", () => {
    cy.mount(
      <LoadingProvider value={[true, null]}>
        <LoadingSkeleton />
      </LoadingProvider>
    );

    cy.get(".loading-skeleton").should("exist");
    cy.get(`.${styles.hide}`).should("exist");
  });
});
