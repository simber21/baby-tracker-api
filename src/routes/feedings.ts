import express from "express";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import { Feeding } from "../models/feedings";
import {
  createTable,
  fetchFeeding,
  fetchFeedings,
  postFeeding,
} from "../repositories/feedingRepository";

const feedingsRouter = express.Router();

feedingsRouter.post("/createTable", (_req, res) => {
  const createFeedingTableTask = pipe(
    createTable(),
    TE.mapLeft((err) => res.status(err.statusCode).send(err.message)),
    TE.map(() => res.sendStatus(200))
  );
  createFeedingTableTask();
});

feedingsRouter.post("/feed", (req, res) => {
  const feeding = req.body as Feeding;
  const postFeedingTask = pipe(
    postFeeding(feeding),
    TE.mapLeft((err) => res.status(404).send(err.message)),
    TE.map(() => res.sendStatus(200))
  );
  postFeedingTask();
});

feedingsRouter.get("/feeds", (_req, res) => {
  const fetchFeedingsTask = pipe(
    fetchFeedings(),
    TE.mapLeft((err) => res.status(err.statusCode).send(err.message)),
    TE.map((feedings) => res.send(JSON.stringify(feedings)))
  );
  fetchFeedingsTask();
});

feedingsRouter.get("/feed/:date/:time", (req, res) => {
  const fetchFeedingTask = pipe(
    fetchFeeding(req.params.date, req.params.time),
    TE.mapLeft((err) => res.status(err.statusCode).send(err.message)),
    TE.map((feeding) => res.send(JSON.stringify(feeding)))
  );
  fetchFeedingTask();
});

export = feedingsRouter;
