import nodemailer from 'nodemailer';
import { RESET_TOKEN_MINUTES } from '../config/domain.js';

function passwordResetText(link) {
  return [
    'Olá!',
    '',
    'Recebemos um pedido para criar uma nova senha no Times de Society.',
    `Use este link em até ${RESET_TOKEN_MINUTES} minutos:`,
    link,
    '',
    'Se você não pediu, ignore este e-mail. Sua senha continua a mesma.',
  ].join('\n');
}

// Sem SMTP (desenvolvimento), o e-mail sai no log do servidor (research.md §8).
export function createMailer(env, logger = console) {
  if (!env.smtp) {
    return {
      async sendPasswordReset(to, link) {
        logger.log(`[e-mail de desenvolvimento] Para: ${to}\n${passwordResetText(link)}`);
      },
    };
  }

  const { host, port, user, pass } = env.smtp;
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user ? { user, pass } : undefined,
  });

  return {
    async sendPasswordReset(to, link) {
      await transport.sendMail({
        from: env.mailFrom,
        to,
        subject: 'Nova senha · Times de Society',
        text: passwordResetText(link),
      });
    },
  };
}
