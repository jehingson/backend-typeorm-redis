import { Request as RequestExpress } from "express";
import { Accounts } from "../app/models/Accounts.model";

export interface Request extends RequestExpress {
  account?: Accounts;
}