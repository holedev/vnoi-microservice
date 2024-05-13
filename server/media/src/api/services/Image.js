import { _PROCESS_ENV } from "../../configs/env/index.js";
import { httpStatusCodes } from "../responses/httpStatusCodes/index.js";
import { gRPCRequest } from "./gRPC.js";

const _IMAGE_PATH = _PROCESS_ENV.STATIC_FILE_URL + "images/";

const ImageService = {
  createCoverImage: async (req, res) => {
    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: {
        path: _IMAGE_PATH + req.file.filename
      }
    });
  }
};

export { ImageService };
