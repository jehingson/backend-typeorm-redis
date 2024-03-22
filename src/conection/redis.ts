import { RedisClientType, createClient } from 'redis';
import { Service } from 'typedi';
              
@Service()
export class Redis {
  client: RedisClientType
  constructor() {
    (async () => {
      this.client = createClient()
      await this.client.connect();
    })()
  }

  set(key: string, value: string) {
    return this.client.set(key, value);
  }

  async get(key: string) {
    return await this.client.get(key)
  } 

  del(key: string) {
    return this.client.del(key)
  }
}