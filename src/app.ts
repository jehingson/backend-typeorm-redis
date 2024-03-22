require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./app/middleware/error";
import routes from "./app/routes";
import responseTime from 'response-time'

export const initializeApp = async () => {
  const app = express();

  // body parser
  app.use(express.json({ limit: "50mb" }));
  app.use(responseTime())
  // cookie parser
  app.use(cookieParser());

  // cors => cross origin resource sharing
  app.use(
    cors({
      origin: process.env.ORIGIN,
    })
  );

  app.use('/api/v1', routes())
  
  // testing api
  app.get("/ping", (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({
      success: true,
      message: "pong",
    });
  });

  app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err);
  });

  app.use(ErrorMiddleware)

  app.listen(process.env.PORT, () => {
    console.log(`Server is connected with port ${process.env.PORT}`);
  })
};
