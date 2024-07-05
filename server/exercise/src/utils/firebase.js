import { ref, remove, set } from "firebase/database";
import { realtimeDB } from "../configs/firebase/index.js";

// PROBLEM STATUS: ["processing", "success", "error"]
// CONSOLE STATUS: ["processing", "results"]

function setProblemStatus(uuid, status) {
  const problemRef = ref(realtimeDB, `problems/${status}/${uuid}`);

  set(problemRef, {
    uuid: uuid
  });
}

function removeProblemStatus(uuid, status) {
  const problemRef = ref(realtimeDB, `problems/${status}/${uuid}`);
  remove(problemRef);
}

function setRunConsoleStatus(uuid, status, message = null) {
  const consoleRef = ref(realtimeDB, `consoles/${status}/${uuid}`);

  const obj = {
    uuid: uuid
  };

  status !== "processing" && (obj.message = message);
  set(consoleRef, obj);
}

function removeRunConsoleStatus(uuid, status) {
  const consoleRef = ref(realtimeDB, `consoles/${status}/${uuid}`);
  remove(consoleRef);
}

function setSubmissionStatus(uuid, status, message = null) {
  const consoleRef = ref(realtimeDB, `submissions/${status}/${uuid}`);

  const obj = {
    uuid: uuid
  };

  status !== "processing" && (obj.message = message);
  set(consoleRef, obj);
}

function removeSubmissionStatus(uuid, status) {
  const consoleRef = ref(realtimeDB, `submissions/${status}/${uuid}`);
  remove(consoleRef);
}

function setUserSubmitProblem(userId, problemId) {
  const submitProblemRef = ref(realtimeDB, `usersubmitlist/${userId}`);

  set(submitProblemRef, {
    problemId: problemId.toString()
  });
}

export {
  setProblemStatus,
  removeProblemStatus,
  setRunConsoleStatus,
  removeRunConsoleStatus,
  setSubmissionStatus,
  removeSubmissionStatus,
  setUserSubmitProblem
};
