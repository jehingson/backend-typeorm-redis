import { Response, NextFunction } from "express";
import { Request } from "../../interfaces/Request.interface";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../../lib/handler/error-handler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { appConfig } from "../../config/app";
import { Redis } from "../../conection/redis";

export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const access_token = req?.cookies?.access_token ?? "";

      if (!access_token)
        return next(new ErrorHandler("Is not Authenticated", 400));

      const decoded = jwt.verify(
        access_token,
        appConfig.accessToken
      ) as JwtPayload;

      if (!decoded) {
        return next(new ErrorHandler("access token in not valid", 400));
      } 

      const redis = new Redis()
      const account = await redis.get(decoded.id);

      if (!account) {
        return next(new ErrorHandler("access token", 400));
      }

      req.account = JSON.parse(account) as any;

      next();
    } catch (error) {
      console.log('error', error)

      return next(new ErrorHandler(error.message, 400))
    }
  }
);


export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.account.role)) {
      return next(new ErrorHandler(`Role: ${req.account.role} is not allowed to access this resource`, 403))
    }
    next()
  }
}
