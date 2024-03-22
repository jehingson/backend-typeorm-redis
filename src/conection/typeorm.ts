import { AppDataSource } from "./data-source";

export const initializeDb = () => {
  AppDataSource.initialize()
    .then(() => console.log('conection DB'))
    .catch((error) => console.log(error))
};
