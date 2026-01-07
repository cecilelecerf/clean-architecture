import { JwtTokenService } from "@infrastructure/adapters/services/JwtTokenService";
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "client" | "conseiller" | "directeur";
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });
  console.log(authHeader);
  const token = authHeader.split(" ")[1];
  try {
    const jwtService = new JwtTokenService();
    const payload = jwtService.validateToken(
      token,
      "auth"
    ) as AuthRequest["user"];
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
