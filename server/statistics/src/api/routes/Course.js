import { Router } from "express";
import { CourseService } from "../services/Course.js";

const router = Router();

router.patch("/lessons/:id", CourseService.updateLessonList);

export { router as CourseRoute };
