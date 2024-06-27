import CourseCard from ".";
import { BrowserRouter as Router } from "react-router-dom";

describe("CourseCard", () => {
  it("Not render with no props", () => {
    cy.mount(
      <Router>
        <CourseCard />
      </Router>
    );
  });
});
