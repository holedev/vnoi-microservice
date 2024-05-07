import { ConflictError } from "../responses/errors/ConflictError.js";
import { BadRequestError } from "../responses/errors/BadRequestError.js";
import { httpStatusCodes } from "../responses/httpStatusCodes/index.js";
import { gRPCRequest } from "./gRPC.js";
import { CourseModel } from "../models/Course.js";
import { CourseSectionModel } from "../models/CourseSection.js";
import { CourseLessonModel } from "../models/CourseLesson.js";
import { Types } from "mongoose";

const CourseService = {
  saveDraft: async (req, res) => {
    const requestId = req.headers["x-request-id"];
    const _id = req.headers["x-user-id"];

    const { title, desc, coverPath, sections, authors } = req.body;

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: "Ok"
    });
  },
  createCourse: async (req, res) => {
    const requestId = req.headers["x-request-id"];
    const _id = req.headers["x-user-id"];

    const { title, desc, coverPath, sections, authors } = req.body;

    const data = {
      authors,
      title,
      desc,
      coverPath,
      sections
    };

    const course = await CourseModel.create(data);

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: course._doc
    });
  },
  updateSectionsOfCourse: async (req, res) => {
    const { id } = req.params;
    const { sections } = req.body;

    const course = await CourseModel.findById(id);

    if (!course) {
      throw new ConflictError("Course not found!");
    }

    course.sections = sections;
    await course.save();

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: course.sections
    });
  },
  updateLessonsOfCourse: async (req, res) => {
    const { id } = req.params;
    const { lessons } = req.body;

    const section = await CourseSectionModel.findById(id);

    if (!section) {
      throw new ConflictError("Section not found!");
    }

    section.lessons = lessons;
    await section.save();

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: section.lessons
    });
  },
  createSection: async (req, res) => {
    const { courseId } = req.body;

    const course = await CourseModel.findById(courseId);

    if (!course) {
      throw new ConflictError("Course not found!");
    }

    const quantity = `0${course.sections.length + 1}`.slice(-2);

    const courseSection = await CourseSectionModel.create({ title: `Section ${quantity}` });

    if (!courseSection) throw new BadRequestError("Cannot create section!");

    const data = {
      _id: courseSection._id
    };

    course.sections.push(data);

    await course.save();

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: {
        _id: courseSection._id,
        title: courseSection.title
      }
    });
  },
  updateSection: async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    const courseSection = await CourseSectionModel.findById(id);

    if (!courseSection) {
      throw new ConflictError("Section not found!");
    }

    courseSection.title = title;

    await courseSection.save();

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: { _id: courseSection._id, title: courseSection.title }
    });
  },
  createLesson: async (req, res) => {
    const { sectionId } = req.body;

    const section = await CourseSectionModel.findById(sectionId);

    if (!section) {
      throw new ConflictError("Section not found!");
    }

    const quantity = `0${section.lessons.length + 1}`.slice(-2);

    const lesson = await CourseLessonModel.create({ title: `Lesson ${quantity}` });

    if (!lesson) throw new BadRequestError("Cannot create lesson!");

    const data = {
      _id: lesson._id
    };

    section.lessons.push(data);

    await section.save();

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: {
        _id: lesson._id,
        title: lesson.title
      }
    });
  },
  updateLesson: async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    const courseLesson = await CourseLessonModel.findById(id);

    if (!courseLesson) {
      throw new ConflictError("Lesson not found!");
    }

    courseLesson.title = title;
    await courseLesson.save();

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: { _id: courseLesson._id, title: courseLesson.title }
    });
  },
  getCourseByLecturer: async (req, res) => {
    const _id = req.headers["x-user-id"];
    const { id } = req.params;

    let course = await CourseModel.findById(id)
      .populate({
        path: "sections._id",
        select: "_id title"
      })
      .lean()
      .select("-__v -updatedAt -createdAt");

    if (!course) {
      throw new ConflictError("Course not found!");
    }

    course.authors = course.authors.map((author) => {
      return {
        _id: author._id,
        fullName: author.fullName,
        email: author.email,
        isMe: author._id === _id
      };
    });

    course.sections = course.sections.map((section) => {
      return {
        _id: section._id._id,
        title: section._id.title
      };
    });

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: course
    });
  },
  getSectionById: async (req, res) => {
    const { id } = req.params;

    let courseSection = await CourseSectionModel.findById(id)
      .populate({
        path: "lessons._id",
        select: "_id title"
      })
      .lean()
      .select("-__v -updatedAt -createdAt");

    if (!courseSection) {
      throw new ConflictError("Section not found!");
    }

    courseSection.lessons = courseSection.lessons.map((lesson) => {
      return {
        _id: lesson._id._id,
        title: lesson._id.title
      };
    });

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: courseSection
    });
  },
  getLessonById: async (req, res) => {
    const { id } = req.params;

    let courseLesson = await CourseLessonModel.findById(id).lean().select("-__v -updatedAt -createdAt");

    if (!courseLesson) {
      throw new ConflictError("Lesson not found!");
    }

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: courseLesson
    });
  }
};

export { CourseService };
