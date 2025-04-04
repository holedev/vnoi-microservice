import amqplib from "amqplib";
import uuid4 from "uuid4";
import { _EXCHANGE, _PROCESS_ENV } from "../env/index.js";
import { FormatData } from "../../api/responses/formatData/index.js";
import { sendLogTelegram } from "../../utils/telegram.js";
import { logInfo } from "./log.js";

const _TIMEOUT_REQUEST = 30000;
let amqplibConnection = null;
let subscribeChannel = null;
let requestChannel = null;
let channel = null;

const getConn = async () => {
  if (amqplibConnection === null) {
    amqplibConnection = await amqplib.connect(_PROCESS_ENV.RABBITMQ_URL);
  }
  amqplibConnection.on("close", () => console.log("Connect close!"));
  return amqplibConnection;
};

const getChannel = async () => {
  try {
    const connection = await getConn();
    if (channel === null) {
      channel = await connection.createChannel();
      await channel.assertExchange(_EXCHANGE.EXERCISE_EXCHANGE, "fanout", { durable: true });
    }
    channel.on("close", () => {
      console.log("Channel close");
    });
    return channel;
  } catch (err) {
    sendLogTelegram("RABBITMQ::CREATE\n" + err);
  }
};

const getSubscribeChannel = async () => {
  try {
    const connection = await getConn();
    if (subscribeChannel === null) {
      subscribeChannel = await connection.createChannel();
    }
    subscribeChannel.on("close", () => {
      console.log("Subscribe channel close");
    });
    return subscribeChannel;
  } catch (err) {
    sendLogTelegram("RABBITMQ::CREATE\n" + err);
  }
};

const getRequestChannel = async () => {
  try {
    const connection = await getConn();
    if (requestChannel === null) {
      requestChannel = await connection.createChannel();
    }
    requestChannel.on("close", () => {
      console.log("Request channel close");
    });
    return requestChannel;
  } catch (err) {
    sendLogTelegram("RABBITMQ::CREATE\n" + err);
  }
};

const subscribeMessage = async (channel, service) => {
  try {
    await channel.assertExchange(_EXCHANGE.CLASS_EXCHANGE, "fanout", { durable: true });
    await channel.assertExchange(_EXCHANGE.USER_EXCHANGE, "fanout", { durable: true });
    const q = await channel.assertQueue(_PROCESS_ENV.SERVICE_NAME, {
      durable: true
    });

    await channel.bindQueue(q.queue, _EXCHANGE.CLASS_EXCHANGE, "");
    await channel.bindQueue(q.queue, _EXCHANGE.USER_EXCHANGE, "");

    console.log(`${_PROCESS_ENV.SERVICE_NAME} ${_PROCESS_ENV.SERVICE_PORT} | QUEUE ${q.queue} waiting`);

    channel.consume(
      q.queue,
      async (msg) => {
        if (msg.content) {
          const { action, data, requestId } = JSON.parse(msg.content.toString());
          logInfo(null, { requestId, method: "RABBITMQ-SUBSCRIBE", body: { action, data } });

          if (!msg.properties.replyTo) {
            service.handleEvent({ action, data });
            channel.ack(msg);
            return;
          }
        }
      },
      { noAck: false }
    );
  } catch (err) {
    sendLogTelegram("RABBITMQ::SUBSCRIBE\n" + err);
  }
};

const requestData = async (QUEUE_NAME, requestPayload, uuid) => {
  try {
    const channel = await getRequestChannel();
    const q = await channel.assertQueue(`${_PROCESS_ENV.SERVICE_NAME}::REQUEST-ASYNC`, {
      durable: false
    });

    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(requestPayload)), {
      replyTo: q.queue,
      correlationId: uuid
    });

    return new Promise((resolve, _reject) => {
      const timeout = setTimeout(() => {
        channel.close();
        resolve(FormatData.warning("TIMEOUT | API could not fullfil the request!"));
      }, _TIMEOUT_REQUEST);

      channel.consume(
        q.queue,
        (msg) => {
          if (msg.content) {
            const receiveData = JSON.parse(msg.content.toString());

            if (msg.properties.correlationId == uuid) {
              resolve(receiveData);
              clearTimeout(timeout);
              channel.ack(msg);
              channel.cancel(msg.fields.consumerTag);
            }
          }
        },
        { noAck: false }
      );
    });
  } catch (err) {
    sendLogTelegram("RABBITMQ::REQUEST-ASYNC\n" + err);
  }
};

const requestAsync = async (QUEUE_NAME, requestPayload) => {
  const uuid = uuid4();
  return await requestData(QUEUE_NAME, requestPayload, uuid);
};

const publishMessage = async (msg) => {
  try {
    const channel = await getChannel();
    channel.publish(_EXCHANGE.EXERCISE_EXCHANGE, "", Buffer.from(JSON.stringify(msg)));
  } catch (err) {
    sendLogTelegram("RABBITMQ::PUBLISH\n" + err);
  }
};

export { subscribeMessage, requestAsync, getChannel, getSubscribeChannel, publishMessage };
