import { Response, NextFunction } from "express";
import { usersFactory } from "@infrastructure/adapters/db/mongo/factories/users";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  banUserSchema,
  registerAdminPayload,
  updateClientSchema,
  userDtoSchema,
} from "@infrastructure/types/user";
import { UserToDTO } from "@domain/entities/UserEntity";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { UserAlreadyBannedError } from "@domain/errors/user/UserAlreadyBannedError";
import { UserCannotBanSelfError } from "@domain/errors/user/UserCannotBanSelfError";
import { UserCannotBanDirectorError } from "@domain/errors/user/UserCannotBanDirectorError";
import { UserNotBannedError } from "@domain/errors/user/UserNotBannedError";
import { UserCannotUnbanDirectorError } from "@domain/errors/user/UserCannotUnbanDirectorError";
const clientUrl = process.env.NEXT_PUBLIC_CLIENT_URL;

export class UserController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const role = req.query.role as string | undefined;
      if (!req.user) return res.sendStatus(401);

      const result = await usersFactory().getUsersByRole.execute({
        role,
        userId: req.user.userId,
      });
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.sendStatus(401);
      const result = await usersFactory().getUser.execute({
        clientId: req.params.id,
        advisorId: req.user?.userId,
      });
      if (!result) return res.sendStatus(404);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.sendStatus(401);

      const result = await usersFactory().getMe.execute({
        userId: req.user?.userId,
      });
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async stats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.sendStatus(401);
      const result = await usersFactory().stats.execute({
        advisorId: req.params.id,
        actorId: req.user?.userId,
      });
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.sendStatus(401);

      const payload = registerAdminPayload.parse(req.body);
      const result = await usersFactory().createUser.execute({
        ...payload,
        confirmationUrl: clientUrl ?? "",
        directorId: req.user.userId,
      });
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async ban(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.sendStatus(401);
      const { status } = banUserSchema.parse(req.body);
      let result:
        | UserToDTO
        | UserNotFoundError
        | UserNotActiveError
        | UserRoleMismatchError
        | UserAlreadyBannedError
        | UserCannotBanSelfError
        | UserCannotBanDirectorError
        | UserNotBannedError
        | UserCannotUnbanDirectorError;
      status
        ? (result = await usersFactory().banUser.execute({
            targetUserId: req.params.id,
            actorId: req.user.userId,
          }))
        : (result = await usersFactory().unbanUser.execute({
            targetUserId: req.params.id,
            actorId: req.user.userId,
          }));
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async updateMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.sendStatus(401);
      const payload = updateClientSchema.parse(req.body);
      const result = await usersFactory().updateUser.execute({
        userId: req.user.userId,
        actorId: req.user.userId,
        ...payload,
      });
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
}
