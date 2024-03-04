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
  run: (data) => {
    return new Promise((resolve, reject) => {
      const { uuid, user, problem, code, testcases } = data;
      const worker = new Worker("./src/utils/workers/run.js", {
        workerData: {
          uuid,
          user,
          problem,
          code,
          testcases
        }
      });

      if (isMainThread) {
        worker.on("message", async (result) => {
          resolve(FormatData.success(result));
        });

        worker.on("error", (error) => {
          resolve(FormatData.error(error.messageObject || error));
        });
      }
    });
  },
  submit: (data) => {
    return new Promise((resolve, reject) => {
      const { uuid, user, problem, code } = data;
      const worker = new Worker("./src/utils/workers/submit.js", {
        workerData: {
          uuid,
          user,
          problem,
          code
        }
      });

      if (isMainThread) {
        worker.on("message", async (result) => {
          resolve(FormatData.success(result));
        });

        worker.on("error", (error) => {
          console.log(error);
          resolve(FormatData.error(error.messageObject || error));
        });
      }
    });
  },
  // rabbitmq
  handleEvent: async (payload) => {
    const { action, data } = payload;

    switch (action) {
      case _ACTION.PROBLEM_CREATE:
        return CompilerService.create(data);

      case _ACTION.PROBLEM_UPDATE:
        return CompilerService.update(data);

      case _ACTION.PROBLEM_RUN:
        return CompilerService.run(data);

      case _ACTION.PROBLEM_SUBMIT:
        return CompilerService.submit(data);

      default:
        console.log("ACTION NOT MATCH!");
    }
  }
};

export { CompilerService };
