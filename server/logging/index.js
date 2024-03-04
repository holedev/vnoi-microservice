import { createChannel, subscribeMessage } from "./src/configs/rabiitmq/index.js";
import { LoggingService } from "./src/service/index.js";

const channel = await createChannel();
subscribeMessage(channel, LoggingService);
