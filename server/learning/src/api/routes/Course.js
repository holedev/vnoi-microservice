import { Router } from "express";
import { CourseService } from "../services/Course.js";
import { VerifyRole } from "../middlewares/VerifyRole.js";

const router = Router();

router.get("/lessons/:id", CourseService.getLessonById);
router.get("/sections/:id", CourseService.getSectionById);
router.get("/:id", CourseService.getCourseByLecturer);
router.post("/", CourseService.createCourse);
router.post("/sections", CourseService.createSection);
router.post("/lessons", CourseService.createLesson);
router.patch("/save-draft/:id", CourseService.saveDraftLesson);
router.patch("/order-sections/:id", CourseService.updateSectionsOfCourse);
router.patch("/order-lessons/:id", CourseService.updateLessonsOfCourse);
router.patch("/sections/:id", CourseService.updateSection);
router.patch("/lessons/:id", CourseService.updateLesson);

export { router as CourseRoute };
