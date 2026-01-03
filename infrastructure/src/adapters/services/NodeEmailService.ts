import nodemailer from "nodemailer";
import {
  EmailService,
  SendEmailOptions,
} from "@application/ports/services/EmailService";
import { NodeEmailTemplateService } from "./NodeEmailTemplateService";
import { Email } from "@domain/values/Email";
import { EmailTemplateData } from "@application/ports/services/EmailTemplateService";

export class NodeEmailService implements EmailService {
  private transporter: nodemailer.Transporter;
  private templateService: NodeEmailTemplateService;

  constructor() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT) || 587;

    if (!smtpHost) {
      throw new Error("SMTP_HOST is not configured");
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASSWORD
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD,
            }
          : undefined,
    });

    this.templateService = new NodeEmailTemplateService();
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || "no-reply@banking-app.com",
        to: options.to.value,
        subject: options.subject,
        html: options.text,
      });
    } catch (error) {
      console.error("Failed to send email:", error);
      throw new Error("Email sending failed");
    }
  }

  async sendConfirmationEmail(
    to: Email,
    data: EmailTemplateData["confirmationEmail"]
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: "🎉 Confirmez votre inscription",
      text: this.templateService.confirmationEmail(data),
    });
  }

  async sendPasswordResetEmail(
    to: Email,
    data: EmailTemplateData["passwordReset"]
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: "🔐 Réinitialisation de votre mot de passe",
      text: this.templateService.passwordResetEmail(data),
    });
  }

  async sendWelcomeEmail(
    to: Email,
    data: EmailTemplateData["welcomeEmail"]
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: "✨ Bienvenue sur Banking App !",
      text: this.templateService.welcomeEmail(data),
    });
  }
  async sendAdminWelcomeEmail(
    to: Email,
    data: EmailTemplateData["welcomeAdminEmail"]
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: "✨ Bienvenue sur Banking App !",
      text: this.templateService.welcomeAdminEmail({ ...data }),
    });
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error("SMTP connection failed:", error);
      return false;
    }
  }
}
