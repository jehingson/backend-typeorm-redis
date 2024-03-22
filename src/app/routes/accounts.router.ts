import { Router } from "express";
import { accountsController } from "../controller";
import { isAuthenticated } from "../middleware/auth";

export default () => {
  const router = Router()

  router.post('/login', accountsController.login)

  router.post('/register', accountsController.register)

  router.post('/activate-code', accountsController.activateAccount)

  router.get('/logout', isAuthenticated, accountsController.logout)

  router.get('/refresh-token', accountsController.updateAccessToken)

  router.get('/me', isAuthenticated,  accountsController.me)

  router.post('/social-auth', accountsController.socialAuth)

  router.put('/update', isAuthenticated, accountsController.updateAccountInfo)


  return router
}