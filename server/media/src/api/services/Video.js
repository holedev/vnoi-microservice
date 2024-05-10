import { VideoModel } from "../models/Video.js";
import { ConflictError } from "../responses/errors/ConflictError.js";
import { httpStatusCodes } from "../responses/httpStatusCodes/index.js";
import { gRPCRequest } from "./gRPC.js";

const _VIDEO_PATH = "http://localhost:9004/videos/";

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
        _id: video._id,
        title: video.title,
        path: _VIDEO_PATH + video.source
      }
    });
  },
  getVideo: async (req, res) => {
    const { id } = req.params;

    const video = await VideoModel.findById(id).lean().select("-__v -updatedAt -createdAt");

    if (!video) {
      throw new ConflictError("Video not found!");
    }

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: {
        ...video,
        path: _VIDEO_PATH + video.source
      }
    });
  },
  updateVideo: async (req, res) => {
    const { id } = req.params;
    const { interactives } = req.body;

    console.log(interactives);

    const video = await VideoModel.findById(id);

    if (!video) {
      throw new ConflictError("Video not found!");
    }

    video.interactives = interactives;
    await video.save();

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: {
        _id: video._id,
        title: video.title,
        interactives: video.interactives
      }
    });
  }
};

export { VideoService };
