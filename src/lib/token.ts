import jwt from "jsonwebtoken";
import { appConfig } from "../config/app";
import bcrypt from "bcrypt";
import { Accounts } from "../app/models/Accounts.model";
import { Response } from "express";
import { Redis } from "../conection/redis";

interface IActivationToken {
  token: string;
  code: string;
}

interface ITokenOptions { 
  expires: Date
  maxAge: number
  httpOnly: boolean
  sameSite: 'lax' | 'strict' | 'none' | undefined
  secure?: boolean
}

export const createActivationToken = (account): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    {
      account,
      activationCode,
    },
    appConfig.secret,
    {
      expiresIn: "5m",
    }
  );
  return {
    token: token,
    code: activationCode,
  };
};


export const signAccessToken = (accountId: string) => {
  return jwt.sign({ id: accountId }, appConfig.accessToken || "", {
    expiresIn: "5m",
  });
}
export const signRefreshToken = (accountId: string) => {
  return jwt.sign({ id: accountId }, appConfig.refreshToken || "", {
    expiresIn: "7d",
  });
}

export const sendToken = async (account: Accounts, statusCode: number, res: Response) => {
  const accountId = account.id
  const accessToken = signAccessToken(accountId);
  const refreshToken = signRefreshToken(accountId);

  const redis = new Redis()
  redis.set(accountId, JSON.stringify(account) as any)

  // parse enviroment variables to integration with false
  const accessTokenExpire = parseInt(appConfig.accessTokenExpire || "300", 10);
  const refreshTokenExpire = parseInt(
    appConfig.refreshTokenExpire || "1200",
    10
  );
  
  const accessTokenOptions : ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
    maxAge: accessTokenExpire * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax'
  }

  const refreshTokenOptions : ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
    maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax'
  }
  // only set secure to true in production
  if (appConfig.nodeEnv === 'production') { 
    accessTokenOptions.secure = true;
    refreshTokenOptions.secure = true
  }

  res.cookie("access_token", accessToken, accessTokenOptions)
  res.cookie("refresh_token", refreshToken, refreshTokenOptions)

  delete account.password

  res.status(statusCode).json({
    success: true,
    account,
    accessToken
  })
};

export const hassPassword = async (password: string) => {
  const hash = await bcrypt.hash(password, 10);
  return hash.replace("$2a$", "$2y$");
};
