import express from "express";
const indexRouter = express.Router();

indexRouter.get("/", (req, res, next) => {
  res.send(
    "Baby Tracker API. Use specific endpoints to interact with baby tracker data."
  );
});

export = indexRouter;
