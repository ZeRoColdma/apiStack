import "dotenv/config";
import express from "express";
import path from "path";
import cors from "cors";
import Youch from "youch";
import * as Sentry from "@sentry/node";
import "express-async-errors";

import routes from "./routes";
import sentryConfig from "./config/sentry";

import "./database/index";

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(cors());
    this.server.use(express.json());
    this.server.use(
      "/files",
      express.static(path.resolve(__dirname, "..", "tmp", "uploads"))
    );
  }

  routes() {
    this.server.use(Sentry.Handlers.tracingHandler());
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
    this.exceptionHandler();
  }

  exceptionHandler() {
    this.server.use(async (err, request, response, next) => {
      if (process.env.NODE_ENV === "development") {
        const errors = await new Youch(err, request).toJSON();

        return response.status(500).json(errors);
      }

      return response.status(500).json({ error: "Erro Interno do Servidor" });
    });
  }
}

export default new App().server;
