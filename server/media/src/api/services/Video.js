import { VideoModel } from "../models/Video.js";
import { httpStatusCodes } from "../responses/httpStatusCodes/index.js";
import { gRPCRequest } from "./gRPC.js";

const _VIDEO_PATH = "videos/";

const VideoService = {
  createVideo: async (req, res) => {
    const requestId = req.headers["x-request-id"];
    const _id = req.headers["x-user-id"];

    const { originalname, mimetype, size, filename } = req.file;

    const userGRPC = await gRPCRequest.getUserByIdAsync(requestId, _id);

    const data = {
      author: userGRPC,
      uuid: filename.split(".")[0],
      title: originalname,
      source: `${filename}`,
      mimetype,
      size
    };

    const video = await VideoModel.create(data);

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: {
        uuid: video.uuid,
        title: video.title,
        path: _VIDEO_PATH + video.source
      }
    });
  }
};

export { VideoService };
