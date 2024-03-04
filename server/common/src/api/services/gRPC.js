import { ClassModel } from "../models/class.js";

const gRPCHandle = {
  getClassById: async (call, callback) => {
    try {
      const _id = call.request?._id;
      const result = await ClassModel.findById(_id).lean();
      callback(null, result);
    } catch (error) {
      callback(error, null);
    }
  }
};

export { gRPCHandle };
