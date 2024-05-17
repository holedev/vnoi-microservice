import { app, PORT } from "./index.js";
import exitHook from "async-exit-hook";
import { _PROCESS_ENV } from "./src/configs/env/index.js";
import { sendLogTelegram } from "./src/utils/telegram.js";
import { EventEmitter } from "events";

EventEmitter.defaultMaxListeners = 100;

app.listen(PORT, () => {
  console.log(`${_PROCESS_ENV.SERVICE_NAME} ${PORT} | Running`);
});

exitHook(() => {
  sendLogTelegram("SHUTING DOWN!");
});
