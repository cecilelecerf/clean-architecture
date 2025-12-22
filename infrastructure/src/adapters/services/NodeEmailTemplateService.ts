import { EmailTemplateService } from "@application/ports/services/EmailTemplateService";
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

export class NodeEmailTemplateService implements EmailTemplateService {
  private readonly baseStyles = `
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.6;
    }
    .content h2 {
      color: #667eea;
      font-size: 24px;
      margin-top: 0;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      margin: 25px 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #6c757d;
      font-size: 14px;
      border-top: 1px solid #e9ecef;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #e9ecef, transparent);
      margin: 30px 0;
    }
    .info-box {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
  `;

  private getBaseTemplate(content: string): string {
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${this.baseStyles}</style>
      </head>
      <body>
        <div class="email-container">
          ${content}
        </div>
      </body>
      </html>
    `;
  }

  confirmationEmail(data: EmailTemplateData["confirmationEmail"]): string {
    const content = `
      <div class="header">
        <h1>🎉 Bienvenue !</h1>
      </div>
      
      <div class="content">
        <h2>Bonjour ${data.firstname},</h2>
        
        <p>Merci de vous être inscrit sur notre plateforme bancaire ! Nous sommes ravis de vous accueillir parmi nous.</p>
        
        <p>Pour finaliser votre inscription et activer votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
        
        <div style="text-align: center;">
          <a href="${data.confirmationLink}" class="button">
            ✓ Confirmer mon email
          </a>
        </div>
        
        <div class="info-box">
          <strong>⏱️ Ce lien est valide pendant 24 heures.</strong><br>
          Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.
        </div>
        
        <div class="divider"></div>
        
        <p style="font-size: 14px; color: #6c757d;">
          Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
          <a href="${
            data.confirmationLink
          }" style="color: #667eea; word-break: break-all;">${
      data.confirmationLink
    }</a>
        </p>
      </div>
      
      <div class="footer">
        <p><strong>Banking App</strong></p>
        <p>Votre conseiller bancaire digital de confiance</p>
        <p style="margin-top: 15px; font-size: 12px;">
          © ${new Date().getFullYear()} Banking App. Tous droits réservés.
        </p>
      </div>
    `;

    return this.getBaseTemplate(content);
  }

  passwordResetEmail(data: EmailTemplateData["passwordReset"]): string {
    const content = `
      <div class="header">
        <h1>🔐 Réinitialisation de mot de passe</h1>
      </div>
      
      <div class="content">
        <h2>Bonjour ${data.firstname},</h2>
        
        <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
        
        <div style="text-align: center;">
          <a href="${data.resetLink}" class="button">
            🔑 Réinitialiser mon mot de passe
          </a>
        </div>
        
        <div class="info-box">
          <strong>⚠️ Important :</strong><br>
          • Ce lien est valide pendant 1 heure<br>
          • Si vous n'avez pas fait cette demande, ignorez cet email<br>
          • Votre mot de passe actuel reste inchangé jusqu'à ce que vous en créiez un nouveau
        </div>
        
        <div class="divider"></div>
        
        <p style="font-size: 14px; color: #6c757d;">
          Lien direct :<br>
          <a href="${
            data.resetLink
          }" style="color: #667eea; word-break: break-all;">${
      data.resetLink
    }</a>
        </p>
      </div>
      
      <div class="footer">
        <p><strong>Banking App</strong></p>
        <p>Pour votre sécurité, ne partagez jamais ce lien.</p>
        <p style="margin-top: 15px; font-size: 12px;">
          © ${new Date().getFullYear()} Banking App. Tous droits réservés.
        </p>
      </div>
    `;

    return this.getBaseTemplate(content);
  }

  welcomeEmail(data: EmailTemplateData["welcomeEmail"]): string {
    const content = `
      <div class="header">
        <h1>✨ Votre compte est activé !</h1>
      </div>
      
      <div class="content">
        <h2>Félicitations ${data.firstname} !</h2>
        
        <p>Votre email a été confirmé avec succès et votre compte est maintenant actif. Vous pouvez dès à présent accéder à tous nos services.</p>
        
        <div style="text-align: center;">
          <a href="${data.loginLink}" class="button">
            🚀 Accéder à mon compte
          </a>
        </div>
        
        <div class="divider"></div>
        
        <h3 style="color: #667eea;">🎯 Prochaines étapes</h3>
        <ul style="line-height: 2;">
          <li>Complétez votre profil pour une expérience personnalisée</li>
          <li>Découvrez nos services et fonctionnalités</li>
          <li>Contactez votre conseiller pour toute question</li>
        </ul>
        
        <div class="info-box">
          💡 <strong>Besoin d'aide ?</strong><br>
          Notre équipe support est disponible du lundi au vendredi de 9h à 18h.
        </div>
      </div>
      
      <div class="footer">
        <p><strong>Banking App</strong></p>
        <p>Merci de votre confiance !</p>
        <p style="margin-top: 15px; font-size: 12px;">
          © ${new Date().getFullYear()} Banking App. Tous droits réservés.
        </p>
      </div>
    `;

    return this.getBaseTemplate(content);
  }

  accountActivatedEmail(data: EmailTemplateData["accountActivated"]): string {
    return this.welcomeEmail(data);
  }
}
