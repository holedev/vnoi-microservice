import { FileModel } from "../models/File.js";
import { httpStatusCodes } from "../responses/httpStatusCodes/index.js";
import { gRPCRequest } from "./gRPC.js";

const _FILE_PATH = "http://localhost:9004/files/";

const FileService = {
  createFiles: async (req, res) => {
    const requestId = req.headers["x-request-id"];
    const _id = req.headers["x-user-id"];

    const userGRPC = await gRPCRequest.getUserByIdAsync(requestId, _id);

    const data = req.files.map((file) => {
      return {
        author: userGRPC,
        uuid: file.filename.split(".")[0],
        title: file.originalname,
        source: `${file.filename}`,
        mimetype: file.mimetype,
        size: file.size
      };
    });

    const files = await FileModel.insertMany(data);

    const formatData = files.map((file) => {
      return {
        _id: file._id,
        title: file.title,
        path: _FILE_PATH + file.source
      };
    });

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: formatData
    });
  }
};

export { FileService };
