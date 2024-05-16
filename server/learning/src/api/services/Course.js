import { ConflictError } from "../responses/errors/ConflictError.js";
import { BadRequestError } from "../responses/errors/BadRequestError.js";
import { httpStatusCodes } from "../responses/httpStatusCodes/index.js";
import { gRPCRequest } from "./gRPC.js";
import { CourseModel } from "../models/Course.js";
import { CourseSectionModel } from "../models/CourseSection.js";
import { CourseLessonModel } from "../models/CourseLesson.js";
import { QuestionModel } from "../models/Question.js";
import { sendToQueue } from "../../configs/rabiitmq/index.js";
import { _ACTION, _SERVICE } from "../../configs/env/index.js";

const CourseService = {
  getCourseByClass: async (req, res) => {
    const { id } = req.params;

    const condition = {
      "publish.classes": { $in: [id] },
      isDraft: false
    };

    const courses = await CourseModel.find(condition)
      .populate({
        path: "sections._id",
        select: "_id title lessons",
        populate: {
          path: "lessons._id",
          select: "_id title files video"
        }
      })
      .lean()
      .select("_id title desc coverPath authors sections isDraft publish updatedAt");

    const formatData = courses.map((course) => {
      const sections = course.sections.map((section) => {
        return {
          _id: section._id._id,
          title: section._id.title,
          lessons: section._id.lessons.map((lesson) => {
            return {
              _id: lesson._id._id,
              title: lesson._id.title,
              files: lesson._id.files,
              video: lesson._id.video
            };
          })
        };
      });

      const statistic = {
        sections: {
          total: sections.length
        },
        lessons: {
          total: sections.reduce((total, section) => {
            return total + section.lessons.length;
          }, 0)
        },
        videos: {
          total: sections.reduce((total, section) => {
            const videoQuantity = section.lessons.reduce((total, lesson) => {
              return total + (lesson.video ? 1 : 0);
            }, 0);

            return total + videoQuantity;
          }, 0)
        },
        files: {
          total: sections.reduce((total, section) => {
            const fileQuantity = section.lessons.reduce((total, lesson) => {
              return total + lesson.files.length;
            }, 0);

            return total + fileQuantity;
          }, 0)
        }
      };

      return {
        _id: course._id,
        title: course.title,
        desc: course.desc,
        coverPath: course.coverPath,
        authors: course.authors.map((author) => {
          return {
            _id: author._id,
            fullName: author.fullName,
            email: author.email
          };
        }),
        updatedAt: course.updatedAt,
        statistic
      };
    });

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: formatData
    });
  },
  getCoursesOfLecturer: async (req, res) => {
    const _id = req.headers["x-user-id"];

    const condition = { authors: { $elemMatch: { _id } }, isDeleted: false };
    const courses = await CourseModel.find(condition).lean().select("_id authors title isDraft updatedAt sections");

    const formatData = courses.map((course) => {
      return {
        _id: course._id,
        title: course.title,
        authors: course.authors.map((author) => {
          return {
            fullName: author.fullName,
            email: author.email
          };
        }),
        isDraft: course.isDraft,
        updatedAt: course.updatedAt,
        sections: course.sections?.length || 0
      };
    });

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: formatData
    });
  },
  getCourseById: async (req, res) => {
    const { id } = req.params;

    const course = await CourseModel.findById(id)
      .populate({
        path: "sections._id",
        select: "_id title lessons",
        populate: {
          path: "lessons._id",
          select: "_id title files video"
        }
      })
      .lean()
      .select("_id title desc coverPath authors sections isDraft updatedAt");

    if (!course) {
      throw new ConflictError("Course not found!");
    }

    const formatData = {
      ...course,
      sections: course.sections.map((section) => {
        return {
          _id: section._id._id,
          title: section._id.title,
          lessons: section._id.lessons.map((lesson) => {
            return {
              _id: lesson._id._id,
              title: lesson._id.title,
              files: lesson._id.files,
              video: lesson._id.video
            };
          })
        };
      })
    };

    const statistic = {
      sections: {
        total: formatData.sections?.length
      },
      lessons: {
        total: formatData.sections?.reduce((total, section) => {
          return total + section.lessons.length;
        }, 0)
      },
      videos: {
        total: formatData.sections?.reduce((total, section) => {
          const videoQuantity = section.lessons.reduce((total, lesson) => {
            return total + (lesson.video ? 1 : 0);
          }, 0);

          return total + videoQuantity;
        }, 0)
      },
      files: {
        total: formatData.sections?.reduce((total, section) => {
          const fileQuantity = section.lessons.reduce((total, lesson) => {
            return total + lesson.files.length;
          }, 0);

          return total + fileQuantity;
        }, 0)
      }
    };

    formatData.statistic = statistic;

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: formatData
    });
  },
  getCourseReview: async (req, res) => {
    const { id } = req.params;

    const course = await CourseModel.findById(id)
      .populate({
        path: "sections._id",
        select: "_id title lessons",
        populate: {
          path: "lessons._id",
          select: "_id title files video"
        }
      })
      .lean()
      .select("_id title desc coverPath authors sections isDraft updatedAt");

    if (!course) {
      throw new ConflictError("Course not found!");
    }

    const formatData = {
      ...course,
      sections: course.sections.map((section) => {
        return {
          _id: section._id._id,
          title: section._id.title,
          lessons: section._id.lessons.map((lesson) => {
            return {
              _id: lesson._id._id,
              title: lesson._id.title,
              files: lesson._id.files,
              video: lesson._id.video
            };
          })
        };
      })
    };

    const statistic = {
      sections: {
        total: formatData.sections?.length
      },
      lessons: {
        total: formatData.sections?.reduce((total, section) => {
          return total + section.lessons.length;
        }, 0)
      },
      videos: {
        total: formatData.sections?.reduce((total, section) => {
          const videoQuantity = section.lessons.reduce((total, lesson) => {
            return total + (lesson.video ? 1 : 0);
          }, 0);

          return total + videoQuantity;
        }, 0)
      },
      files: {
        total: formatData.sections?.reduce((total, section) => {
          const fileQuantity = section.lessons.reduce((total, lesson) => {
            return total + lesson.files.length;
          }, 0);

          return total + fileQuantity;
        }, 0)
      }
    };

    formatData.statistic = statistic;

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: formatData
    });
  },
  publishCourse: async (req, res) => {
    const { id } = req.params;
    const { classes, time } = req.body;

    const course = await CourseModel.findById(id);

    if (!course) {
      throw new ConflictError("Course not found!");
    }

    course.publish.classes = classes;
    course.publish.time = time;
    course.isDraft = false;

    await course.save();

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: course._id
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

    if (!course) throw new BadRequestError("Cannot create course!");

    const formatData = {
      _id: course._id,
      title: course.title,
      desc: course.desc,
      coverPath: course.coverPath,
      sections: course.sections,
      authors: course.authors.map((author) => {
        return {
          _id: author._id,
          fullName: author.fullName,
          email: author.email,
          isMe: author._id === _id
        };
      })
    };

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: formatData
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
  saveDraftLesson: async (req, res) => {
    const requestId = req.headers["x-request-id"];
    const _id = req.headers["x-user-id"];

    const { id } = req.params;
    const { video, files, content } = req.body;

    const lesson = await CourseLessonModel.findById(id);

    if (!lesson) {
      throw new ConflictError("Lesson not found!");
    }

    lesson.video = video;
    lesson.files = files;
    lesson.content = content;

    await lesson.save();

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: lesson
    });
  },
  updateCourseInfo: async (req, res) => {
    const { id } = req.params;
    const { title, desc, coverPath, authors } = req.body;

    const condition = {
      _id: id,
      isDeleted: false
    };

    const course = await CourseModel.findOne(condition);

    if (!course) {
      throw new ConflictError("Course not found!");
    }

    const newAuthors =
      authors?.map((author) => {
        return { _id: author._id, fullName: author.fullName, email: author.email };
      }) || [];

    course.title = title;
    course.desc = desc;
    course.coverPath = coverPath;
    course.authors = newAuthors;
    await course.save();

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: course._id
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

    const condition = { _id: id, isDeleted: false };

    let courseSection = await CourseSectionModel.findOne(condition)
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
    const _id = req.headers["x-user-id"];
    const requestId = req.headers["x-request-id"];
    const { id } = req.params;

    console.log(_id);

    const condition = { _id: id, isDeleted: false };

    let courseLesson = await CourseLessonModel.findOne(condition).lean().select("-__v -updatedAt -createdAt");

    if (courseLesson.video?._id) {
      const videoGRPC = await gRPCRequest.getVideoByIdAsync(requestId, courseLesson.video._id);
      const data = JSON.parse(videoGRPC.jsonStr);

      courseLesson.video = {
        _id: data._id,
        title: data.title,
        path: courseLesson.video?.path,
        interactives: data.interactives.map((i) => {
          return {
            _id: i._id,
            type: i.type,
            time: i.time,
            isAnswered: i.answerList?.find((answer) => answer == _id) ? true : false
          };
        })
      };
    }

    if (!courseLesson) {
      throw new ConflictError("Lesson not found!");
    }

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: courseLesson
    });
  },
  softDelete: async (req, res) => {
    const { id } = req.params;

    const course = await CourseModel.findById(id);

    if (!course) {
      throw new ConflictError("Course not found!");
    }

    course.isDeleted = true;
    await course.save();

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: course._id
    });
  },
  createQuestion: async (req, res) => {
    const { title, answer1, answer2, answer3, answer4 } = req.body;

    const answers = [
      { value: answer1, isCorrect: true },
      { value: answer2, isCorrect: false },
      { value: answer3, isCorrect: false },
      { value: answer4, isCorrect: false }
    ];

    const data = {
      title,
      answers
    };

    const question = await QuestionModel.create(data);

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: question
    });
  },
  getQuestionById: async (req, res) => {
    const _id = req.headers["x-user-id"];
    const { id } = req.params;

    const question = await QuestionModel.findById(id).lean().select("_id title answers answersList");

    if (!question) {
      throw new ConflictError("Question not found!");
    }

    const formatData = {
      _id: question._id,
      title: question.title,
      answers: question.answers
        .map((answer) => {
          return {
            _id: answer._id,
            value: answer.value
          };
        })
        .sort(() => Math.random() - 0.5)
    };

    const isAnswered = question.answersList.find((answer) => answer._id == _id);

    if (isAnswered) {
      formatData.isAnswered = {
        value: formatData.answers.find((answer) => answer._id == isAnswered.value).value,
        time: isAnswered.time
      };
    }

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: formatData
    });
  },
  checkResultQuestion: async (req, res) => {
    const _id = req.headers["x-user-id"];
    const requestId = req.headers["x-request-id"];

    const { questionId, answerId, videoId } = req.body;

    let question = await QuestionModel.findById(questionId).select("_id answers answersList");

    if (!question) {
      throw new ConflictError("Question not found!");
    }

    const answer = question.answers.find((answer) => answer._id == answerId);
    if (!answer) {
      throw new ConflictError("Answer not found!");
    }

    const answerIsExist = question.answersList.find((answer) => answer._id == _id);
    if (answerIsExist) {
      answerIsExist.value = answerId;
      answerIsExist.time = new Date();
    } else {
      question.answersList.push({ _id, value: answerId, time: new Date() });
    }

    await question.save();

    const payload = {
      requestId,
      action: _ACTION.ANSWER_QUESION,
      data: {
        videoId,
        interactiveId: questionId,
        userId: _id
      }
    };

    sendToQueue(_SERVICE.MEDIA_SERVICE.NAME, payload);

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: {
        result: answer.isCorrect,
        correctAnswer: question.answers.find((answer) => answer.isCorrect)
      }
    });
  },
  deleteSectionOfCourse: async (req, res) => {
    const { courseId, sectionId } = req.body;

    const section = await CourseSectionModel.findOne({ _id: sectionId, isDeleted: false });

    if (!section) {
      throw new ConflictError("Section not found!");
    }

    section.isDeleted = true;
    await section.save();

    const course = await CourseModel.findOne({ _id: courseId, isDeleted: false });

    if (!course) {
      throw new ConflictError("Course not found!");
    }

    course.sections = course.sections.filter((section) => section._id.toString() != sectionId);
    await course.save();

    return res.status(httpStatusCodes.OK).json({
      status: "success"
    });
  },
  deleteLessonOfSection: async (req, res) => {
    const { sectionId, lessonId } = req.body;

    const lesson = await CourseLessonModel.findOne({ _id: lessonId, isDeleted: false });

    if (!lesson) {
      throw new ConflictError("Lesson not found!");
    }

    lesson.isDeleted = true;
    await lesson.save();

    const section = await CourseSectionModel.findOne({ _id: sectionId, isDeleted: false });

    if (!section) {
      throw new ConflictError("Section not found!");
    }

    section.lessons = section.lessons.filter((lesson) => lesson._id.toString() != lessonId);
    await section.save();

    return res.status(httpStatusCodes.OK).json({
      status: "success"
    });
  }
};

export { CourseService };
