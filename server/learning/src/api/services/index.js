import { _ACTION } from "../../configs/env/index.js";

const LearningService = {
  updateStatusInteractive: async (data) => { 

  },
  handleEvent: async (payload) => {
    const { action, data } = payload;

    switch (action) {
      case _ACTION.CLASS_UPDATE:
        await LearningService.updateStatusInteractive(data);
        return;

      default:
        console.log("NO ACTION MATCH");
    }
  }
};

export { LearningService };
