import { Router } from "express";
import { FileService } from "../services/File.js";
import { uploadFiles } from "../../configs/multer/index.js";

const router = Router();

router.post("/", uploadFiles, FileService.createFiles);

export { router as FileRoute };
