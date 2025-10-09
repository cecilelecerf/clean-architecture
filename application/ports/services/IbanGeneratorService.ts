import { IBAN } from "@domain/values/IBAN";

export interface IbanGeneratorService {
  generateIban(): Promise<IBAN>;
}
