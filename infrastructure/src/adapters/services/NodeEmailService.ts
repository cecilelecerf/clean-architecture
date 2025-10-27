import nodemailer from "nodemailer";
import {
  EmailService,
  SendEmailOptions,
} from "@application/ports/services/EmailService";

export class NodeEmailService implements EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configuration via variables d'environnement
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true si port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || "no-reply@example.com",
      to: options.to.value,
      subject: options.subject,
      html: options.text,
    });
  }
}
