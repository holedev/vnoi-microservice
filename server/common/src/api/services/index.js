import { _ACTION, _PROCESS_ENV } from "../../configs/env/index.js";
import { httpStatusCodes } from "../responses/httpStatusCodes/index.js";
import { ConflictError } from "../responses/errors/ConflictError.js";
import { ForbiddenError } from "../responses/errors/ForbiddenError.js";
import { FormatData } from "../responses/formatData/index.js";
import { ClassModel } from "../models/class.js";

const CommonService = {
  create: async (req, res) => {
    const { name } = req.body;

    const classCurr = await ClassModel.findOne({ name });

    if (classCurr) {
      throw new ConflictError("Class already exists !!!");
    }

    const newClass = await ClassModel.create({
      name
    });

    return res.status(httpStatusCodes.CREATED).json({
      status: "success",
      data: {
        _id: newClass._id,
        name: newClass.name,
        createdAt: newClass.createdAt,
        updatedAt: newClass.updatedAt
      }
    });
  },
  getTotalStudentOfClass: async (req, res) => {},
  getAllClass: async (req, res) => {
    const { search, page = 1, limit = 9 } = req.query;

    let classList = await ClassModel.find().lean().select("_id name createdAt updatedAt").sort("name");

    if (search?.trim())
      classList = classList.filter(
        (c) => c.name.toLowerCase().includes(search?.toLowerCase()) || c._id.toString() === search.trim()
      );

    const skip = (Number(page) - 1) * Number(limit);
    const totalPage = Math.ceil(classList.length / Number(limit));
    const currentPage = Number(page);
    classList = classList.slice(skip, skip + Number(limit));

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: classList,
      currentPage,
      totalPage
    });
  },
  getClassesWithoutOLYMPIC: async (req, res) => {
    let classList = await ClassModel.find({
      name: { $ne: "OLYMPIC" }
    })
      .lean()
      .select("_id name")
      .sort("name");

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: classList
    });
  },
  deleteClassByAdmin: async (req, res) => {
    const { id } = req.params;

    const classCurr = await ClassModel.findByIdAndDelete(id);

    if (!classCurr) {
      throw new ConflictError("Class not found !!!");
    }

    return res.status(httpStatusCodes.NO_CONTENT).json({
      status: "success",
      data: null
    });
  },
  handleEvent: async (payload) => {
    payload = JSON.parse(payload);
    const { action, data } = payload;

    console.log(action, data);
  }
};

export { CommonService };
