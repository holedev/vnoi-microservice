import { httpStatusCodes } from "../responses/httpStatusCodes/index.js";
import { gRPCRequest } from "./gRPC.js";

const _IMAGE_PATH = "http://localhost:9004/images/";

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
