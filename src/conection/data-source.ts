import "reflect-metadata";
import { DataSource } from "typeorm";
import models from "../app/models";
import { databaseConfig } from "../config/database";

export const AppDataSource = new DataSource({
  type: databaseConfig.type as any,
  database: databaseConfig.database,
  username: databaseConfig.username,
  password: databaseConfig.password,
  host: databaseConfig.host,
  port: databaseConfig.port,
  synchronize: databaseConfig.useSync,
  entities: models,
  migrationsRun: false,
});
