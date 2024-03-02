import { Router } from "express";
import { UserService } from "../services/index.js";
import { VerifyRole } from "../middlewares/VerifyRole.js";

const router = Router();

router.get("/:id", UserService.getById);
router.get("/", VerifyRole.admin, UserService.getAllByAdmin);
router.post("/auth", UserService.auth);
router.patch("/update/:id", VerifyRole.admin, UserService.updateByAdmin);
router.patch("/update", UserService.update);
router.delete("/:id", VerifyRole.admin, UserService.softDeleteByAdmin);

export { router as UserRoute };
