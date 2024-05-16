import { _ACTION } from "../../configs/env/index.js";
import { VideoModel } from "../models/Video.js";

const MediaService = {
  updateInteractiveStatus: async (data) => {
    const { videoId, interactiveId, userId } = data;

    if (!videoId || !interactiveId || !userId) {
      throw new Error("Missing videoId or interactiveId or userId!");
    }

    const condition = {
      _id: videoId,
      isDeleted: false
    };

    let video = await VideoModel.findOne(condition);

    if (!video) {
      throw new Error("Video not found!");
    }

    let interactiveIdx = null;
    const interactive = video.interactives.find((i, idx) => {
      if (i._id.toString() == interactiveId) {
        interactiveIdx = idx;
        return true;
      }
    });

    if (!interactive) {
      throw new Error("Interactives not found!");
    }

    const answerList = interactive.answerList || [];

    const isExistUser = answerList.find((user) => user.toString() == userId);

    if (!isExistUser) {
      answerList.push(userId);
      video.interactives[interactiveIdx].answerList = answerList;
      video.markModified("interactives");
      await video.save();
    }
  },

  handleEvent: async (payload) => {
    const { action, data } = payload;

    switch (action) {
      case _ACTION.ANSWER_QUESION:
        await MediaService.updateInteractiveStatus(data);
        return;

      default:
        console.log("NO ACTION MATCH");
    }
  }
};

export { MediaService };
