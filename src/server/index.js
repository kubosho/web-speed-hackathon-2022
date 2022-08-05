import fastifyCompress from "@fastify/compress";
import fastifySensible from "@fastify/sensible";
import fastify from "fastify";

import { User } from "../model/index.js";

import { apiRoute } from "./routes/api.js";
import { spaRoute } from "./routes/spa.jsx";
import { createConnection } from "./typeorm/connection.js";
import { initialize } from "./typeorm/initialize.js";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

async function createServer() {
  const server = fastify({
    logger: IS_PRODUCTION
      ? false
      : {
          prettyPrint: {
            ignore: "pid,hostname",
            translateTime: "SYS:HH:MM:ss",
          },
        },
  });
  server.register(fastifySensible);
  server.register(fastifyCompress, {
    global: true,
  });

  server.addHook("onRequest", async (req, res) => {
    const connection = await createConnection();
    const repo = connection.getRepository(User);

    const userId = req.headers["x-app-userid"];
    if (userId !== undefined) {
      const user = await repo.findOne(userId);
      if (user === undefined) {
        res.unauthorized();
        return;
      }
      req.user = user;
    }
  });

  server.addHook("onRequest", async (req, res) => {
    res.header("Connection", "keep-alive");
  });

  server.register(apiRoute, { prefix: "/api" });
  server.register(spaRoute);

  return server;
}

const start = async () => {
  const server = await createServer();

  try {
    await initialize();
    await server.listen({ host: "0.0.0.0", port: process.env.PORT || 3000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
