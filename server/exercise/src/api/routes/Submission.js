import { Router } from "express";
import { SubmissionService } from "../services/Submission.js";
import { VerifyRole } from "../middlewares/VerifyRole.js";

const router = Router();

router.get("/get-by-admin", VerifyRole.admin, SubmissionService.getAllSubmissionByAdmin);
router.get(
  "/get-submissions-without-author-without-problem",
  VerifyRole.admin,
  SubmissionService.getSubmissionsWithoutAuthorWithoutProblem
);
router.post("/get-by-user", SubmissionService.getSubmissionOfUser);
router.post("/", SubmissionService.create);
router.delete(
  "/delete-submissions-without-author-without-problem",
  VerifyRole.admin,
  SubmissionService.deleteSubmissionWithoutAuthorWithoutProblem
);
router.delete("/:id", VerifyRole.admin, SubmissionService.deleteSubmissionByAdmin);

export { router as SubmissionRoute };
