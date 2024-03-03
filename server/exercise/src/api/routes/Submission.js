import { Router } from "express";
import { SubmissionService } from "../services/Submission.js";

const router = Router();

router.get("/get-by-admin", SubmissionService.getAllSubmissionByAdmin);
router.get("/get-folders-invalid", SubmissionService.getFolderInvalid);
router.get(
  "/get-submissions-without-author-without-problem",
  SubmissionService.getSubmissionsWithoutAuthorWithoutProblem
);
router.post("/get-by-user", SubmissionService.getSubmissionOfUser);
router.post("/", SubmissionService.create);
// router.delete(
//   "/delete-submissions-without-author-without-problem",
//   SubmissionService.deleteSubmissionWithoutAuthorWithoutProblem
// );
router.delete("/clear-folder-invalid", SubmissionService.clearFolderNoAuthorAndSubmissionUUID);
router.delete("/:id", SubmissionService.deleteSubmissionByAdmin);

export { router as SubmissionRoute };
