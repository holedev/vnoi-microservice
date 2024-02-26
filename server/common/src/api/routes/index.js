import { Router } from "express";
import { CommonService } from "../services/index.js";

const router = Router();

router.get("/get-total-student-of-class/:id", CommonService.getTotalStudentOfClass);
router.get("/get-classes-without-olympic", CommonService.getClassesWithoutOLYMPIC);
router.get("/", CommonService.getAllClass);
router.post("/", CommonService.create);
router.delete("/:id", CommonService.deleteClassByAdmin);

export { router as ClassRoute };
