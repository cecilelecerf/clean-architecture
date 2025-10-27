import { Email } from "@domain/values/Email";

export interface SendEmailOptions {
  to: Email;
  subject: string;
  text: string;
}

export interface EmailService {
  sendEmail(options: SendEmailOptions): Promise<void>;
}
