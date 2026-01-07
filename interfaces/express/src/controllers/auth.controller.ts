import { usersFactory } from "@infrastructure/adapters/db/mongo/factories/users";
import { loginSchema } from "@infrastructure/types/user";
import { Request, Response, NextFunction } from "express";

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await usersFactory().login.execute({
        email,
        plainedPassword: password,
      });
      if (result instanceof Error) {
        return res.status(401).json({ message: result.message });
      }
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
