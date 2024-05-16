import { _PROCESS_ENV } from "../../configs/env/index.js";
import { encodeHLSWithMultipleVideoStreams } from "../../utils/ffmpeg.js";
import { deleteFile } from "../../utils/file.js";
import { VideoModel } from "../models/Video.js";
import { ConflictError } from "../responses/errors/ConflictError.js";
import { httpStatusCodes } from "../responses/httpStatusCodes/index.js";
import { gRPCRequest } from "./gRPC.js";

const _VIDEO_PATH = _PROCESS_ENV.STATIC_FILE_URL + "videos/";

const VideoService = {
  createVideo: async (req, res) => {
    const requestId = req.headers["x-request-id"];
    const _id = req.headers["x-user-id"];

    const { originalname, mimetype, size, filename, path } = req.file;

    const userGRPC = await gRPCRequest.getUserByIdAsync(requestId, _id);

    const uuid = filename.split(".")[0];

    const isCreateHLS = await encodeHLSWithMultipleVideoStreams(path, uuid);

    if (!isCreateHLS) {
      throw new ConflictError("Failed to create HLS video!");
    }

    const data = {
      author: userGRPC,
      uuid,
      title: originalname,
      source: `${filename}`,
      mimetype,
      size
    };

    const video = await VideoModel.create(data);

    deleteFile(path);

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: {
        _id: video._id,
        title: video.title,
        path: _VIDEO_PATH + uuid + "/master.m3u8"
      }
    });
  },
  updateVideoInteractive: async (req, res) => {
    const { id } = req.params;
    const { interactives } = req.body;

    const condition = {
      _id: id,
      isDeleted: false
    };

    const video = await VideoModel.findOne(condition);

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
        interactives: video.interactives,
        answerList: []
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
        interactives: video.interactives || [],
        path: _VIDEO_PATH + video.uuid + "/master.m3u8"
      }
    });
  },
  softDeleteVideoByLecturer: async (req, res) => {
    const { id } = req.params;

    const condition = {
      _id: id,
      isDeleted: false
    };

    const video = await VideoModel.findOne(condition);

    if (!video) {
      throw new ConflictError("Video not found!");
    }

    video.isDeleted = true;
    await video.save();

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: {
        _id: video._id,
        isDeleted: video.isDeleted
      }
    });
  }
};

export { VideoService };
