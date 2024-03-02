import { _ACTION } from "../../configs/env/index.js";
import { Worker, isMainThread } from "worker_threads";
import { FormatData } from "../../api/responses/formatData/index.js";

const CompilerService = {
  create: (data) => {
    return new Promise((resolve, reject) => {
      const { uuid, author, solutionCode, script } = data;
      const worker = new Worker("./src/utils/workers/create.js", {
        workerData: {
          uuid,
          author,
          solutionCode,
          script
        }
      });

      if (isMainThread) {
        worker.on("message", async (result) => {
          resolve(FormatData.success());
        });

        worker.on("error", (error) => {
          resolve(FormatData.error(error));
        });
      }
    });
  },
  update: (data) => {
    return new Promise((resolve, reject) => {
      const { uuid, author, solutionCode, script } = data;
      const worker = new Worker("./src/utils/workers/update.js", {
        workerData: {
          uuid,
          author,
          solutionCode,
          script
        }
      });

      if (isMainThread) {
        worker.on("message", async () => {
          resolve(FormatData.success());
        });

        worker.on("error", (error) => {
          resolve(FormatData.error(error));
        });
      }
    });
  },
  run: () => {},
  submit: () => {},
  // rabbitmq
  handleEvent: async (payload) => {
    const { action, data } = payload;

    switch (action) {
      case _ACTION.PROBLEM_CREATE:
        return CompilerService.create(data);

      case _ACTION.PROBLEM_UPDATE:
        return CompilerService.update(data);

      default:
        console.log("ACTION NOT MATCH!");
    }
  },
  handleGRPC: {
    sayHello: (call, callback) => {
      callback(null, { message: "Hello " + call.request.name });
    }
  }
};

export { CompilerService };
