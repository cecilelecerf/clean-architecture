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
  welcomeAdminEmail: {
    lastname: string;
    firstname: string;
    confirmationLink: string;
    email: string;
    temporaryPassword: string;
  };
};

export interface EmailTemplateService {
  confirmationEmail(data: EmailTemplateData["confirmationEmail"]): string;
  passwordResetEmail(data: EmailTemplateData["passwordReset"]): string;
  welcomeEmail(data: EmailTemplateData["welcomeEmail"]): string;
  welcomeAdminEmail({
    firstname,
    lastname,
    confirmationLink,
    email,
    temporaryPassword,
  }: EmailTemplateData["welcomeAdminEmail"]): string;
  accountActivatedEmail(data: EmailTemplateData["accountActivated"]): string;
}
