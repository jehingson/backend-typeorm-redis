import { initializeApp } from "./app";
import { initializeDb } from "./conection/typeorm";

// create server
async function bootstrap() {
  await initializeApp();
  await initializeDb()
}

bootstrap();
