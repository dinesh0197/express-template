import nodemailer from "nodemailer";
import { credentials } from "../configs/credentials";
import ejs from "ejs";

export const SendMail = async (
  templatePath: string,
  subject: string,
  recipient: string,
  data: any
) => {
  try {
    const host = credentials.emailHost;
    const port = credentials.emailPort;
    const email = credentials.emailAddress;
    const pswd = credentials.emailPassword;

    let transporter = nodemailer.createTransport({
      host,
      port,
      secure: true,
      auth: {
        user: email,
        pass: pswd,
      },
      // === add this === //
      tls: { rejectUnauthorized: false },
    });

    ejs.renderFile(templatePath, data, (err, html) => {
      if (err) {
        console.error(err);
        throw (err as Error).message;
      } else {
        let mailOptions = {
          from: `PRESTIGE METALS <incipient.test@gmail.com>`,
          to: recipient,
          subject: subject,
          html: html,
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error(err);
            throw (err as Error).message;
          } else {
            console.log("Email sent: " + info.response);
            return true;
          }
        });
      }
    });
  } catch (err) {
    console.log(err);
    throw (err as Error).message;
  }
};
