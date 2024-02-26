import amqplib from "amqplib";
import { _PROCESS_ENV } from "../env/index.js";
import { InternalServerError } from "../../api/responses/errors/InternalServerError.js";

const createChannel = async () => {
  const connection = await amqplib.connect(_PROCESS_ENV.RABBITMQ_URL);
  const channel = await connection.createChannel();
  return channel;
};

const subscribeMessage = async (channel, service) => {
  try {
    const q = await channel.assertQueue(_PROCESS_ENV.SERVICE_NAME, {
      durable: true
    });

    console.log(
      `${_PROCESS_ENV.SERVICE_NAME} ${_PROCESS_ENV.SERVICE_PORT} | Waiting for messages in queue: ${q.queue}`
    );

    channel.consume(q.queue, async (msg) => {
      if (!msg.properties.replyTo) {
        console.log("No replyTo property, so it is a log message");
        service.handleEvent(msg.content.toString());
        channel.ack(msg);
        return;
      }
      const response = await service.handleEvent(msg.content.toString());
      channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
        correlationId: msg.properties.correlationId
      });
      channel.ack(msg);
    });
  } catch (error) {
    throw new InternalServerError(error.message);
  }
};

export { createChannel, subscribeMessage };
