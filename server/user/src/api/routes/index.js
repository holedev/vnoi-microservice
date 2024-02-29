import { Router } from "express";
import { UserService } from "../services/index.js";

const router = Router();

router.get("/", UserService.getAllByAdmin);
router.post("/auth", UserService.auth);
router.patch("/update/:id", UserService.updateByAdmin);
router.patch("/update", UserService.update);
router.delete("/:id", UserService.softDeleteByAdmin);

export { router as UserRoute };
