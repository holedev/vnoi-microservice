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
          reject(FormatData.error(error));
        });
      }
    });
  },
  update: () => {},
  run: () => {},
  submit: () => {},
  // rabbitmq
  handleEvent: async (payload) => {
    payload = JSON.parse(payload);
    const { action, data } = payload;

    if (action === _ACTION.PROBLEM_CREATE) {
      return CompilerService.create(data);
    }

    return FormatData.error("ACTION NOT MATCH SERVICE!!!");
  },
  handleGRPC: {
    sayHello: (call, callback) => {
      callback(null, { message: "Hello " + call.request.name });
    }
  }
};

export { CompilerService };
