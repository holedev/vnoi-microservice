import { httpStatusCodes } from "../responses/httpStatusCodes/index.js";

const FileService = {
  createFiles: async (req, res) => {
    console.log(req.fileNames);

    return res.status(httpStatusCodes.OK).json({
      status: "success",
      data: "OK"
    });
  }
};

export { FileService };
