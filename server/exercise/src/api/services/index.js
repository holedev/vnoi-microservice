import { _ACTION } from "../../configs/env/index.js";

const ExerciseService = {
  handleEvent: (payload) => {
    const { action, data } = payload;

    switch (action) {
      case _ACTION.CLASS_UPDATE:
        console.log(data);
        return;

      default:
        console.log("NO ACTION MATCH");
    }
  }
};

export { ExerciseService };
