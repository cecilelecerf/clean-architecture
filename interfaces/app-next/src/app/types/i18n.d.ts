type CommonMessages = typeof import('../messages/common/fr.json');
type HomeMessages = typeof import('../messages/home.fr.json');
type AuthMessages = typeof import('../messages/auth/fr.json');

declare global {
  interface IntlMessages extends CommonMessages, HomeMessages, AuthMessages {}
}
