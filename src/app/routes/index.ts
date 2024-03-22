import { Router } from "express"
import accountsRouter from "./accounts.router"

export default () => {

  const router = Router()
  
  router.use('/accounts', accountsRouter())

  return router
}