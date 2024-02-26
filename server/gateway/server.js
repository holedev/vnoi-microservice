import { app, PORT } from "./index.js";
import exitHook from "async-exit-hook";
import { _PROCESS_ENV } from "./src/configs/env/index.js";

app.listen(PORT, () => {
  console.log(`${_PROCESS_ENV.SERVICE_NAME} ${PORT} | Running`);
});

exitHook(() => {
  console.log(`${_PROCESS_ENV.SERVICE_NAME} ${PORT} | Shutting down`);
});
