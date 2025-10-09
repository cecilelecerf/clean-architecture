export interface EncryptionService {
  hash(plainedTextPassword: string): Promise<string>;
  compare(
    plainedTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
}
