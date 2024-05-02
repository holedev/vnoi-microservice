import { getChannel, subscribeMessage } from "./src/configs/rabiitmq/index.js";
import { LoggingService } from "./src/service/index.js";

process.setMaxListeners(Infinity);

const channel = await getChannel();
subscribeMessage(channel, LoggingService);
