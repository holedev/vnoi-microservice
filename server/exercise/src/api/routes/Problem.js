import { Router } from "express";
import { ProblemService } from "../services/Problem.js";

const router = Router();

router.get("/edit/:slug", ProblemService.getProblemByLecturer);
router.get("/get-by-admin", ProblemService.getAllProblemByAdmin);
// router.get("/get-folders-invalid", ProblemService.getFolderInvalid);
// router.get("/get-problems-without-author", ProblemService.getProblemsWithoutAuthor);
router.get("/get-by-lecturer", ProblemService.getAllProblemByLecturer);
router.get("/get-competition", ProblemService.getCompetitionProblem);
router.get("/get-rank-competition", ProblemService.getRankCompetition);
// router.get("/get-result/:id", ProblemService.getResultByLecturer);
router.get("/:slug", ProblemService.getBySlug);
router.get("/", ProblemService.getAllProblem);
// router.post("/run", ProblemService.runTest);
router.post("/", ProblemService.create);
// router.patch("/edit/:slug", ProblemService.updateProblemByLecturer);
router.patch("/:slug", ProblemService.softDelete);
router.delete("/delete-by-admin/:slug", ProblemService.deleteProblemByAdmin);
// router.delete("/delete-problem-without-author", ProblemService.deleteProblemWithoutAuthor);
// router.delete("/clear-folder-invalid", ProblemService.clearFolderNoAuthorAndProblemUUID);

export { router as ProblemRoute };
