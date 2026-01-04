import { Email } from "@domain/values/Email";
import { EmailTemplateData } from "./EmailTemplateService";

export interface SendEmailOptions {
  to: Email;
  subject: string;
  text: string;
}

export interface EmailService {
  sendEmail(options: SendEmailOptions): Promise<void>;
  sendConfirmationEmail(
    to: Email,
    data: EmailTemplateData["confirmationEmail"]
  ): Promise<void>;

  sendPasswordResetEmail(
    to: Email,
    data: EmailTemplateData["passwordReset"]
  ): Promise<void>;

  sendWelcomeEmail(
    to: Email,
    data: EmailTemplateData["welcomeEmail"]
  ): Promise<void>;

  sendAdminWelcomeEmail(
    to: Email,
    data: EmailTemplateData["welcomeAdminEmail"]
  ): Promise<void>;

  verifyConnection?(): Promise<boolean>;
}
