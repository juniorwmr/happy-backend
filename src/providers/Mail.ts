import { createTransport } from 'nodemailer';

import mailConfig from '../config/mail';

export const transportMail = createTransport({
  host: mailConfig.host,
  port: mailConfig.port,
  auth: mailConfig.auth,
});
