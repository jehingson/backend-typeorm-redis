import { Service } from "typedi";
import { Repository } from "typeorm";
import { Accounts } from "../models/Accounts.model";
import { AppDataSource } from "../../conection/data-source";
import { Redis } from "../../conection/redis";

@Service()
export class AccountService {
  repository: Repository<Accounts>;
  redis: Redis
  constructor() {
    this.repository = AppDataSource.getRepository(Accounts);
    this.redis = new Redis()
  }
  getAccountById = async (id: string) => {
    const account = await this.redis.get(id)
    if (account) {
      return JSON.parse(account)
    }
    return this.repository.findOneBy({ id }) 
  };
}
