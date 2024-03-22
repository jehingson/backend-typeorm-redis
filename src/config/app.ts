export const appConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  name: process.env.NAME,
  shortName: process.env.SHORT_NAME,
  multipleLogin: process.env.MULTIPLE_LOGIN === 'true',
  https: process.env.HTTPS === 'true',
  secret: process.env.SECRET_KEY,
  accessToken: process.env.ACCESS_TOKEN,
  refreshToken: process.env.REFRESH_TOKEN,
  accessTokenExpire: process.env.ACCESS_TOKEN_EXPIRE,
  refreshTokenExpire: process.env.REFRESH_TOKEN_EXPIRE,
};
