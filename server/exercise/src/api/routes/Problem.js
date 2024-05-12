import { Router } from "express";
import { ProblemService } from "../services/Problem.js";
import { VerifyRole } from "../middlewares/VerifyRole.js";

const router = Router();

router.get("/get-detail-submissions/:id", VerifyRole.lecturer, ProblemService.getDetailsSubmissions);
router.get("/edit/:slug", VerifyRole.lecturer, ProblemService.getProblemByLecturer);
router.get("/get-by-id/:id", VerifyRole.lecturer, ProblemService.getProblemById);
router.get("/get-by-admin", VerifyRole.admin, ProblemService.getAllProblemByAdmin);
router.get("/get-problems-without-author", VerifyRole.admin, ProblemService.getProblemsWithoutAuthor);
router.get("/get-by-lecturer", VerifyRole.lecturer, ProblemService.getAllProblemByLecturer);
router.get("/get-problems-of-lecturer", VerifyRole.lecturer, ProblemService.getProblemsOfLecturer);
router.get("/get-competition", ProblemService.getCompetitionProblem);
router.get("/get-rank-competition", ProblemService.getRankCompetition);
router.get("/get-result/:id", VerifyRole.lecturer, ProblemService.getResultByLecturer);
router.get("/:slug", ProblemService.getBySlug);
router.get("/", ProblemService.getAllProblem);
router.post("/run", ProblemService.runTest);
router.post("/", VerifyRole.lecturer, ProblemService.create);
router.patch("/edit/:slug", VerifyRole.lecturer, ProblemService.updateProblemByLecturer);
router.patch("/:slug", VerifyRole.lecturerOrAdmin, ProblemService.softDelete);
router.delete("/delete-by-admin/:slug", VerifyRole.admin, ProblemService.deleteProblemByAdmin);
router.delete("/delete-problem-without-author", VerifyRole.admin, ProblemService.deleteProblemWithoutAuthor);

export { router as ProblemRoute };
