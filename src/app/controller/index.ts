import Container from "typedi";
import { AccountsController } from "./accounts.controller";

export const accountsController = Container.get(AccountsController)