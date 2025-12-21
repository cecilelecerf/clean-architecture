export type EmailTemplateData = {
  confirmationEmail: {
    firstname: string;
    confirmationLink: string;
  };
  passwordReset: {
    firstname: string;
    resetLink: string;
  };
  welcomeEmail: {
    firstname: string;
    loginLink: string;
  };
  accountActivated: {
    firstname: string;
    loginLink: string;
  };
};

export interface EmailTemplateService {
  confirmationEmail(data: EmailTemplateData["confirmationEmail"]): string;
  passwordResetEmail(data: EmailTemplateData["passwordReset"]): string;
  welcomeEmail(data: EmailTemplateData["welcomeEmail"]): string;
  accountActivatedEmail(data: EmailTemplateData["accountActivated"]): string;
}
