import { Router } from "express";
import { VideoService } from "../services/Video.js";
import { VerifyRole } from "../middlewares/VerifyRole.js";
import { uploadVideo } from "../../configs/multer/index.js";

const router = Router();

router.get("/:id", VideoService.getVideo);
router.post("/", VerifyRole.lecturer, uploadVideo, VideoService.createVideo);
router.patch("/delete-by-lecturer/:id", VerifyRole.lecturer, VideoService.softDeleteVideoByLecturer);
router.patch("/update-interactive/:id", VerifyRole.lecturer, VideoService.updateVideoInteractive);

export { router as VideoRoute };
