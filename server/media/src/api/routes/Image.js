import { Router } from "express";
import { ImageService } from "../services/Image.js";
import { uploadImage } from "../../configs/multer/index.js";

const router = Router();

router.post("/", uploadImage, ImageService.createImage);
router.delete("/:id", ImageService.deleteImage);

export { router as ImageRoute };
