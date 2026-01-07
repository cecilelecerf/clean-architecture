import { usersFactory } from "@infrastructure/adapters/db/mongo/factories/users";
import { loginSchema, tokenSchema, RegisterPayload, reqRegisterSchema, resetPasswordSchema } from "@infrastructure/types/user";
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

  static async confirmRegistration(req: Request, res: Response, next: NextFunction){
    try{
      const data = tokenSchema.parse(req.body);

      const result = await usersFactory().confirmRegistration.execute(data);

      if (result instanceof Error) {
        return res
          .status(result.statusCode ?? 400)
          .json({ message: result.message });
      }

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction){
    try{
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const result = await usersFactory().forgotPassword.execute({
        email,
        confirmationUrl: process.env.NEXT_PUBLIC_CLIENT_URL!, // TODO: Pas sur de ça
      });

      if (result instanceof Error) {
        return res
          .status(result.statusCode ?? 404)
          .json({ name: result.name, message: result.message });
      }

      return res.json({
        success: true,
        message:
          "Si cet email existe, un lien de réinitialisation a été envoyé.",
      });
    } catch (error) {
      next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction){
    try{
      const data: RegisterPayload = reqRegisterSchema.parse(req.body);

      const result = await usersFactory().register.execute({
        ...data,
        confirmationUrl: process.env.NEXT_PUBLIC_CLIENT_URL!, // TODO:  Toujours pas sur de ça
      });

      if (result instanceof Error) {
        return res
          .status(result.statusCode ?? 400)
          .json({ message: result.message });
      }

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction){
    try{
      const { token, password } = resetPasswordSchema.parse(req.body);

      const result = await usersFactory().resetPassword.execute({
        token,
        newPassword: password,
      });

      if (result instanceof Error) {
        return res
          .status(404)
          .json({ name: result.name, message: result.message });
      }

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
