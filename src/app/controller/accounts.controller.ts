import { Service } from "typedi";
import { NextFunction, Response } from "express";
import { Request } from "../../interfaces/Request.interface";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../../lib/handler/error-handler";
import { AppDataSource } from "../../conection/data-source";
import { Accounts } from "../models/Accounts.model";
import { v4 as uuidv4 } from "uuid";
import { Redis } from "../../conection/redis";
import {
  createActivationToken,
  hassPassword,
  sendToken,
} from "../../lib/token";
import { Mailer } from "../../utils/maile";
import { verify, JwtPayload } from "jsonwebtoken";
import { appConfig } from "../../config/app";
import { Repository } from "typeorm";
import { accountService } from "../services";

interface ILoginRequest {
  email: string;
  password: string;
}

interface IActivarionRequest {
  activation_token: string;
  activation_code: string;
}

@Service()
export class AccountsController {
  redis: Redis;
  repository: Repository<Accounts>;
  constructor() {
    this.repository = AppDataSource.getRepository(Accounts);
    this.redis = new Redis();
  }

  me = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const accountId = req?.account?.id ?? "";
        const account = await accountService.getAccountById(accountId);

        if (account) {
          delete account.password;
        }

        return res.status(201).json({
          success: true,
          account,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
  );

  login = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email, password } = req.body as ILoginRequest;
        if (!email || !password)
          return next(new ErrorHandler("Campos incompletos.", 400));

        const account = await this.repository.findOneBy({ email });

        if (!account) {
          return next(
            new ErrorHandler("Inválido correo electrónico o contraseña.", 400)
          );
        }

        const isValue = await account.comparePassword(password);

        if (!isValue)
          return next(
            new ErrorHandler("Inválido correo electrónico o contraseña.", 400)
          );

        delete account.password;

        await sendToken(account, 200, res);
      } catch (error) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
  );

  register = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email, username, password } = req.body;
        const isEmailExits = await this.repository.findOneBy({ email });
        if (isEmailExits)
          return next(
            new ErrorHandler(
              "El correo electrónico se encuentra registrado.",
              400
            )
          );

        const account = new Accounts();
        account.id = uuidv4();
        account.email = email;
        account.username = username;
        account.password = await hassPassword(password);

        const activationToken = createActivationToken(account);
        const { code, token } = activationToken;

        const data = { username: account.username, code };

        try {
          const mailer = new Mailer();
          await mailer.sendMail({
            email,
            template: "activation.ejs",
            data,
            subject: "Activar Cuenta",
          });

          return res.status(201).json({
            success: true,
            message: `Por favor ${account.username}, revisa tu correo electrónico para activar la cuenta.`,
            activationToken: token,
          });
        } catch (error) {
          console.log("[EMAIL]", error);
          return next(new ErrorHandler(error.message, 400));
        }
      } catch (error) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
  );

  activateAccount = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { activation_token, activation_code } =
          req.body as IActivarionRequest;
        const newAccount = verify(activation_token, appConfig.secret) as {
          account: Accounts;
          activationCode: string;
        };

        if (newAccount.activationCode !== activation_code) {
          return next(new ErrorHandler("Invalid activation code", 400));
        }

        const email = newAccount.account.email;
        const isEmailExits = await this.repository.findOneBy({ email });
        if (isEmailExits)
          return next(
            new ErrorHandler(
              "El correo electrónico se encuentra registrado.",
              400
            )
          );

        await this.repository.save(newAccount.account);

        res.status(201).json({
          success: true,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
  );

  updateAccessToken = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const refresh_token = req.cookies.refresh_token as string;
        const decode = verify(
          refresh_token,
          appConfig.refreshToken
        ) as JwtPayload;
        const message = "Could not refresh token";

        if (!decode) {
          return next(new ErrorHandler(message, 400));
        }

        const session = await this.redis.get(decode.id as string);

        if (!session) {
          return next(new ErrorHandler(message, 400));
        }

        const account = JSON.parse(session);

        await sendToken(account, 200, res);
      } catch (error) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
  );

  logout = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        res.cookie("access_token", "", { maxAge: 1 });
        res.cookie("refresh_token", "", { maxAge: 1 });

        const { account } = req as Request;
        const accountId = account.id || "";

        const redis = new Redis();
        redis.del(accountId);

        res.status(200).json({
          success: true,
          message: "Logged out success",
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
  );

  socialAuth = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email, username, avatar } = req.body;
        const account = await this.repository.findOneBy({ email })

        if (!account) {
          let newAccount = new Accounts();
          newAccount.id = uuidv4();
          newAccount.email = email;
          newAccount.username = username;
          if (avatar) {
            newAccount.avatar = avatar
          }
          newAccount = await this.repository.save(newAccount);
          delete newAccount.password
          sendToken(newAccount, 200, res)
        } else {
          delete account.password
          sendToken(account, 200, res)
        }

      } catch (error) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
  );


  updateAccountInfo = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const  { username, email } = req.body
        const accountId = req.account.id

        const account = await this.repository.findOneBy({ id: accountId })

        if (!account) return next(new ErrorHandler("Account is not register", 400))

        if (email && account) {
          const isEmailExits = await this.repository.findOneBy({ email })
          if (isEmailExits) {
            return next(new ErrorHandler("Email already exist", 400))
          }
          account.email = email
        }

        if (username) account.username = username
        this.repository.save(account)


        this.redis.set(accountId, JSON.stringify(account))
        delete account.password
        
        return res.status(200).json({
          success: true,
          account
        })


      } catch (error) {
        return next(new ErrorHandler(error.message, 400));
      }
    })

}
