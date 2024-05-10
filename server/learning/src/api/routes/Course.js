import { Router } from "express";
import { CourseService } from "../services/Course.js";
import { VerifyRole } from "../middlewares/VerifyRole.js";

const router = Router();

router.get("/get-courses-by-lecturer", CourseService.getCoursesOfLecturer);
router.get("/get-course-by-lecturer/:id", CourseService.getCourseByLecturer);
router.get("/get-course-by-class/:id", CourseService.getCourseByClass);
router.get("/lessons/:id", CourseService.getLessonById);
router.get("/sections/:id", CourseService.getSectionById);
router.get("/review/:id", CourseService.getCourseReview);
router.get("/:id", CourseService.getCourseById);
router.post("/", CourseService.createCourse);
router.post("/sections", CourseService.createSection);
router.post("/lessons", CourseService.createLesson);
router.patch("/save-draft/:id", CourseService.saveDraftLesson);
router.patch("/publish/:id", CourseService.publishCourse);
router.patch("/order-sections/:id", CourseService.updateSectionsOfCourse);
router.patch("/order-lessons/:id", CourseService.updateLessonsOfCourse);
router.patch("/sections/:id", CourseService.updateSection);
router.patch("/lessons/:id", CourseService.updateLesson);
router.patch("/:id", CourseService.softDelete);

export { router as CourseRoute };
