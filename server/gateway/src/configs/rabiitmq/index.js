import amqplib from "amqplib";
import uuid4 from "uuid4";
import { _PROCESS_ENV } from "../env/index.js";

const _TIMEOUT_REQUEST = 10000;
let amqplibConnection = null;

const createChannel = async () => {
  try {
    const connection = await amqplib.connect(_PROCESS_ENV.RABBITMQ_URL);
    const channel = await connection.createChannel();
    return channel;
  } catch (err) {
    console.log(err);
  }
};

const getChannel = async () => {
  if (amqplibConnection === null) {
    amqplibConnection = await amqplib.connect(_PROCESS_ENV.RABBITMQ_URL);
  }
  try {
    return await amqplibConnection.createChannel();
  } catch (err) {
    console.log(err);
  }
};

const requestData = async (QUEUE_NAME, requestPayload, uuid) => {
  const channel = await getChannel();

  try {
    const q = await channel.assertQueue(`${_PROCESS_ENV.SERVICE_NAME}::REQUEST-ASYNC`, {
      durable: false
    });

    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(requestPayload)), {
      replyTo: q.queue,
      correlationId: uuid
    });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        channel.close();
        resolve("TIMEOUT | API could not fullfil the request!");
      }, _TIMEOUT_REQUEST);

      channel.consume(q.queue, (msg) => {
        if (msg.properties.correlationId == uuid) {
          resolve(JSON.parse(msg.content.toString()));
          clearTimeout(timeout);
        } else {
          reject("Data Not found!");
        }
        channel.ack(msg);
        channel.cancel(msg.fields.consumerTag);
      });
    });
  } catch (err) {
    console.log(err);
  }
};

const requestAsync = async (QUEUE_NAME, requestPayload) => {
  const uuid = uuid4();
  return await requestData(QUEUE_NAME, requestPayload, uuid);
};

export { createChannel, requestAsync };
