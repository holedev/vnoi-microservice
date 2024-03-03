import { Router } from "express";
import { CommonService } from "../services/index.js";
import { VerifyRole } from "../middlewares/VerifyRole.js";

const router = Router();

// router.get("/get-total-student-of-class/:id", CommonService.getTotalStudentOfClass);
router.get("/get-classes-without-olympic", CommonService.getClassesWithoutOLYMPIC);
router.get("/", CommonService.getAllClass);
router.post("/", VerifyRole.admin, CommonService.create);
router.patch("/:id", VerifyRole.admin, CommonService.update);
router.delete("/:id", VerifyRole.admin, CommonService.deleteClassByAdmin);

export { router as ClassRoute };
