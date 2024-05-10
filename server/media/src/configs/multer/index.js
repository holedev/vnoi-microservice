import multer from "multer";
import { BadRequestError } from "../../api/responses/errors/BadRequestError.js";
import uuidv4 from "uuid4";

const _MAX_BYTES = 50000000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "video") {
      return cb(null, "uploads/videos/");
    }

    if (file.fieldname === "file") {
      return cb(null, "uploads/files/");
    }

    if (file.fieldname === "image") {
      return cb(null, "uploads/images/");
    }
  },
  filename: function (req, file, cb) {
    const uniqueId = uuidv4();
    req.fileNames = req.fileNames || [];
    req.fileNames.push(uniqueId);
    cb(null, `${uniqueId}.${file.mimetype.split("/")[1]}`);
  }
});

const multerConfig = multer({ storage, limits: { fileSize: _MAX_BYTES } });

async function uploadFiles(req, res, next) {
  const upload = multerConfig.array("file");

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

async function uploadImage(req, res, next) {
  const upload = multerConfig.single("image");

  upload(req, res, function (err) {
    if (err) {
      return next(new BadRequestError(err.message));
    }
    next();
  });
}

export { uploadFiles, uploadVideo, uploadImage };
