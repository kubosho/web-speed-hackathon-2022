import fs from "fs/promises";
import path from "path";

import dayjs from "dayjs";
import { Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";

import { assets } from "../../client/foundation/utils/UrlUtils.js";
import { BettingTicket, Race, User } from "../../model/index.js";
import { createConnection } from "../typeorm/connection.js";
import { initialize } from "../typeorm/initialize.js";

/**
 * @type {import('fastify').FastifyPluginCallback}
 */
export const apiRoute = async (fastify) => {
  fastify.get("/users/me", { compress: false }, async (req, res) => {
    const repo = (await createConnection()).getRepository(User);

    res.header("Cache-Control", "private");
    if (req.user != null) {
      res.send(req.user);
    } else {
      const user = await repo.save(new User());
      res.send(user);
    }
  });

  fastify.post("/users/me/charge", { compress: false }, async (req, res) => {
    if (req.user == null) {
      throw fastify.httpErrors.unauthorized();
    }

    const { amount } = req.body;
    if (typeof amount !== "number" || amount <= 0) {
      throw fastify.httpErrors.badRequest();
    }

    const repo = (await createConnection()).getRepository(User);

    req.user.balance += amount;
    await repo.save(req.user);

    res.header("Cache-Control", "no-store");
    res.status(204).send();
  });

  fastify.get("/races", { compress: false }, async (req, res) => {
    const since =
      req.query.since != null ? dayjs.unix(req.query.since) : undefined;
    const until =
      req.query.until != null ? dayjs.unix(req.query.until) : undefined;

    if (since != null && !since.isValid()) {
      throw fastify.httpErrors.badRequest();
    }
    if (until != null && !until.isValid()) {
      throw fastify.httpErrors.badRequest();
    }

    const repo = (await createConnection()).getRepository(Race);

    const where = {};
    if (since != null && until != null) {
      Object.assign(where, {
        startAt: Between(
          since.utc().format("YYYY-MM-DD HH:mm:ss"),
          until.utc().format("YYYY-MM-DD HH:mm:ss"),
        ),
      });
    } else if (since != null) {
      Object.assign(where, {
        startAt: MoreThanOrEqual(since.utc().format("YYYY-MM-DD HH:mm:ss")),
      });
    } else if (until != null) {
      Object.assign(where, {
        startAt: LessThanOrEqual(since.utc().format("YYYY-MM-DD HH:mm:ss")),
      });
    }

    const races = await repo.find({
      where,
    });

    res.header("Cache-Control", "max-age=86400");
    res.send({ races });
  });

  fastify.get("/races/:raceId", { compress: false }, async (req, res) => {
    const repo = (await createConnection()).getRepository(Race);

    const race = await repo.findOne(req.params.raceId, {
      relations: ["entries", "entries.player", "trifectaOdds"],
    });

    if (race === undefined) {
      throw fastify.httpErrors.notFound();
    }

    res.header("Cache-Control", "max-age=86400");
    res.send(race);
  });

  fastify.get(
    "/races/:raceId/betting-tickets",
    { compress: false },
    async (req, res) => {
      if (req.user == null) {
        throw fastify.httpErrors.unauthorized();
      }

      const repo = (await createConnection()).getRepository(BettingTicket);
      const bettingTickets = await repo.find({
        where: {
          race: {
            id: req.params.raceId,
          },
          user: {
            id: req.user.id,
          },
        },
      });

      res.header("Cache-Control", "max-age=86400");
      res.send({
        bettingTickets,
      });
    },
  );

  fastify.get("/banks", { compress: false }, async (_req, res) => {
    const baseDir = path.join(__dirname, "..");
    const distDir = `${baseDir}/dist`;
    const bankList = await fs.readFile(`${distDir}/banks.json`, "utf8");

    res.header("Cache-Control", "max-age=2678400");
    res.type("application/json");
    res.send(bankList);
  });

  fastify.post(
    "/races/:raceId/betting-tickets",
    { compress: false },
    async (req, res) => {
      if (req.user == null) {
        throw fastify.httpErrors.unauthorized();
      }

      if (req.user.balance < 100) {
        throw fastify.httpErrors.preconditionFailed();
      }

      if (typeof req.body.type !== "string") {
        throw fastify.httpErrors.badRequest();
      }

      if (
        !Array.isArray(req.body.key) ||
        req.body.key.some((n) => typeof n !== "number")
      ) {
        throw fastify.httpErrors.badRequest();
      }

      const bettingTicketRepo = (await createConnection()).getRepository(
        BettingTicket,
      );
      const bettingTicket = await bettingTicketRepo.save(
        new BettingTicket({
          key: req.body.key,
          race: {
            id: req.params.raceId,
          },
          type: req.body.type,
          user: {
            id: req.user.id,
          },
        }),
      );

      const userRepo = (await createConnection()).getRepository(User);
      req.user.balance -= 100;
      await userRepo.save(req.user);

      res.header("Cache-Control", "no-store");
      res.send(bettingTicket);
    },
  );

  fastify.post("/initialize", { compress: false }, async (_req, res) => {
    await initialize();
    res.header("Cache-Control", "no-store");
    res.status(204).send();
  });
};
