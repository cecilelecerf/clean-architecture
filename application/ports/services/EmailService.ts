export interface SendEmailOptions {
  to: string,
  subject: string,
  text: string
}

export interface EmailService {
  sendEmail(options: SendEmailOptions): Promise<void>;
}