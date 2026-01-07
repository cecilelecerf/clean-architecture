import jwt from "jsonwebtoken";
import {
  TokenService,
  GenerateTokenOptions,
} from "@application/ports/services/TokenService";

const AUTH_SECRET = process.env.JWT_AUTH_SECRET || "secret_auth";
const CONFIRMATION_SECRET =
  process.env.JWT_CONFIRMATION_SECRET || "secret_confirmation";
const TOKEN_EXPIRATION = "1h";

export class JwtTokenService implements TokenService {
  async generateAuthToken({
    userId,
    extraPayload,
  }: GenerateTokenOptions): Promise<string> {
    const payload = { userId, ...extraPayload };
    return jwt.sign(payload, AUTH_SECRET, { expiresIn: TOKEN_EXPIRATION });
  }

  async generateConfirmationToken({
    userId,
    extraPayload,
  }: GenerateTokenOptions): Promise<string> {
    const payload = { userId, ...extraPayload };
    return jwt.sign(payload, CONFIRMATION_SECRET, { expiresIn: "24h" });
  }

  validateToken(
    token: string,
    expectedType: "auth" | "confirmation" = "auth"
  ): any {
    const secret = expectedType === "auth" ? AUTH_SECRET : CONFIRMATION_SECRET;
    return jwt.verify(token, secret);
  }
}
