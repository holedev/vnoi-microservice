import { Router } from "express";
import { ImageService } from "../services/Image.js";
import { VerifyRole } from "../middlewares/VerifyRole.js";
import { uploadImage } from "../../configs/multer/index.js";

const router = Router();

router.post("/", uploadImage, ImageService.createCoverImage);

export { router as ImageRoute };
