import { Service } from "typedi";
import { createTransport, SendMailOptions, Transporter } from 'nodemailer';
import { mailConfig } from "../config/email";
import * as path from 'path';
import ejs from 'ejs'


@Service() 
export class Mailer { 
  transport: Transporter

  constructor() {
    this.transport = createTransport({
      host: mailConfig.host,
      secure: true,
      auth: {
        user: mailConfig.user,
        pass: mailConfig.password,
      },
    } as any);
  }

  sendMail = async (
    options: SendMailOptions
  ) => {

    const { email, subject, template, data } = options

    const templatePath = path.join(__dirname, "../template", template)
    const html: string = await ejs.renderFile(templatePath, data)

    const mailOptions = {
      from: mailConfig.user,
      to: email,
      subject,
      html
    }

    return await this.transport.sendMail(mailOptions);
  }  

}