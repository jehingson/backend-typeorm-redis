export const mailConfig = {
  host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
  service: process.env.SMTP_SERVICE, 
  user: process.env.SMTP_MAIL || '',
  password: process.env.SMTP_PASSWORD || "",
};
