import multer from "multer";
import { BadRequestError } from "../../api/responses/errors/BadRequestError.js";
import uuidv4 from "uuid4";

const _MAX_BYTES = 20000000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "video") {
      return cb(null, "uploads/videos/");
    }

    if (file.fieldname === "files") {
      return cb(null, "uploads/files/");
    }
  },
  filename: function (req, file, cb) {
    const uniqueId = uuidv4();
    req.fileNames = req.fileNames || [];
    req.fileNames.push(uniqueId);
    cb(null, `${uniqueId}.${file.mimetype.split("/")[1]}`);
  }
});

// TODO: limit size
const multerConfig = multer({ storage });

async function uploadFiles(req, res, next) {
  const upload = multerConfig.array("files");

  upload(req, res, function (err) {
    if (err) {
      return next(new BadRequestError(err.message));
    }
    next();
  });
}

async function uploadVideo(req, res, next) {
  const upload = multerConfig.single("video");

  upload(req, res, function (err) {
    if (err) {
      return next(new BadRequestError(err.message));
    }
    next();
  });
}

export { uploadFiles, uploadVideo };
