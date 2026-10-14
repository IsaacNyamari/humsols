import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/lib/env";

export type MailMessage = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export type MailSender = (message: MailMessage) => Promise<void>;

let transporter: Transporter | null = null;
let override: MailSender | null = null;

function smtpTransport(): Transporter {
  if (!transporter) {
    const { host, port, secure, user, password } = env.smtp;
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass: password } : undefined,
    });
  }
  return transporter;
}

/** Send an email using SMTP, or print it to the log when MAIL_DRIVER=log. */
export async function sendMail(message: MailMessage): Promise<void> {
  if (override) return override(message);

  if (env.mailDriver === "log") {
    const to = Array.isArray(message.to) ? message.to.join(", ") : message.to;
    console.info(`[mail:log] to=${to} subject="${message.subject}"\n${message.text}\n`);
    return;
  }

  await smtpTransport().sendMail({
    from: env.mailFrom,
    to: message.to,
    replyTo: message.replyTo,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });
}

/** Tests only: replace the sender (pass null to restore). */
export function setMailSenderForTests(sender: MailSender | null) {
  override = sender;
}
