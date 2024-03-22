import { Response, NextFunction } from "express";
import { Request } from "../../interfaces/Request.interface";

export const CatchAsyncError =
  (theFunc: any) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(theFunc(req, res, next).catch(next));
  };
