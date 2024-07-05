import { _PROCESS_ENV } from "../../configs/env/index.js";
import { deleteFile } from "../../utils/file.js";
import { httpStatusCodes } from "../responses/httpStatusCodes/index.js";

const _IMAGE_PATH = _PROCESS_ENV.STATIC_FILE_URL + "images/";

const ImageService = {
  createImage: async (req, res) => {
    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: {
        path: _IMAGE_PATH + req.file.filename
      }
    });
  },
  deleteImage: async (req, res) => {
    const { id } = req.params;

    deleteFile(`uploads/images/${id}`);

    return res.status(httpStatusCodes.NO_CONTENT).json({});
  }
};

export { ImageService };
