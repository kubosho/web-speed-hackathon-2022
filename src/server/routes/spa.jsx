import { join } from "path";

import fastifyStatic from "@fastify/static";
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { ServerStyleSheet } from "styled-components";

import { App } from "../../client/foundation/App";

import { Meta } from "./views/Meta";
import { Script } from "./views/Script";

/**
 * @type {import('fastify').FastifyPluginCallback}
 */
export const spaRoute = async (fastify) => {
  fastify.register(fastifyStatic, {
    root: join(__dirname, "public"),
    wildcard: false,
  });

  fastify.get("/favicon.ico", () => {
    throw fastify.httpErrors.notFound();
  });

  fastify.get("*", { compress: false }, async (req, reply) => {
    const sheet = new ServerStyleSheet();

    try {
      const app = renderToString(
        sheet.collectStyles(
          <StaticRouter location={req.url}>
            <App sheet={sheet.instance} />
          </StaticRouter>,
        ),
      );
      const style = sheet.getStyleTags();
      const metaString = renderToString(<Meta />);
      const scriptString = renderToString(<Script />);
      const htmlString = `<!DOCTYPE html>
          <html>
            <head>
              ${metaString}
              ${style}
              ${scriptString}
            </head>
            <body id="root">${app}</body>
          </html>
      `;

      reply.type("text/html");
      reply.send(htmlString);
    } catch (err) {
      console.error(err);
      reply.status(500);
    } finally {
      sheet.seal();
    }
  });
};
