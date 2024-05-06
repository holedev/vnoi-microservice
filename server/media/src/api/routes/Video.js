import { Router } from "express";
import { VideoService } from "../services/Video.js";
import { VerifyRole } from "../middlewares/VerifyRole.js";
import { uploadVideo } from "../../configs/multer/index.js";

const router = Router();

router.post("/", uploadVideo, VideoService.createVideo);

export { router as VideoRoute };
