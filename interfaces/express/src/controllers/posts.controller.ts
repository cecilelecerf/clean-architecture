import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { postsFactory } from "@infrastructure/adapters/db/mongo/factories/posts";
import { newPostSchema, publishActionSchema } from "@infrastructure/types/feed";
import { queryPostSchema } from "@infrastructure/types/pagination";
import { usersFactory } from "@infrastructure/adapters/db/mongo/factories/users";
import { sseManager } from "../utils/sse";

export class PostsController {
  static async getWithFilter(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const paramsObj: Record<string, string | boolean | number | string[]> =
        {};

      for (const [key, val] of Object.entries(req.query)) {
        if (key === "limit" || key === "page") {
          paramsObj[key] = Number(val);
        } else if (key === "status") {
          paramsObj[key] = val === "true";
        } else if (key === "tagsId" && typeof val === "string") {
          paramsObj[key] = val.split(",");
        } else {
          paramsObj[key] = val as string;
        }
      }

      const parsed = queryPostSchema.parse(paramsObj);
      const result = await postsFactory().getPostWithFilter.execute({
        page: parsed.page,
        limit: parsed.limit,
        tagsId: parsed.tagsId,
        title: parsed.title,
        userId,
        fromDate: parsed.fromDate ? new Date(parsed.fromDate) : undefined,
        toDate: parsed.toDate ? new Date(parsed.toDate) : undefined,
        status: parsed.status,
      });

      if (result instanceof Error) {
        return res.status(result.statusCode ?? 404).json({
          name: result.name,
          message: result.message,
        });
      }

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async add(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const payload = newPostSchema.parse(req.body);
      const result = await postsFactory().addPost.execute({
        advisorId: userId,
        title: payload.title,
        content: payload.content,
        tagsId: payload.tagsId,
        userId: payload.userId,
      });

      if (result instanceof Error) {
        return res.status(result.statusCode ?? 404).json({
          name: result.name,
          message: result.message,
        });
      }

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadWithTag(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const result = await postsFactory().getUnreadPostWithTag.execute({
        clientId: userId,
      });

      if (result instanceof Error) {
        return res.status(result.statusCode ?? 404).json({
          name: result.name,
          message: result.message,
        });
      }

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getByIdWithTags(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { postId } = req.params;

      const result = await postsFactory().getPostByIdWithTags.execute({
        userId: userId,
        id: postId,
      });

      if (result instanceof Error) {
        return res.status(result.statusCode ?? 404).json({
          name: result.name,
          message: result.message,
        });
      }

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async edit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { postId } = req.params;

      const payload = newPostSchema.partial().parse(req.body);

      const result = await postsFactory().editPost.execute({
        userId,
        id: postId,
        ...payload,
      });

      if (result instanceof Error) {
        return res.status(result.statusCode ?? 404).json({
          name: result.name,
          message: result.message,
        });
      }

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { postId } = req.params;

      const result = await postsFactory().deletePost.execute({
        userId: userId,
        id: postId,
      });

      if (result instanceof Error) {
        return res.status(result.statusCode ?? 404).json({
          name: result.name,
          message: result.message,
        });
      }

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { postId } = req.params;
      const { status } = publishActionSchema.parse(req.body);

      const post = await postsFactory().updatePostStatusPost.execute({
        userId: userId,
        postId: postId,
        status: status === "publish",
      });

      if (post instanceof Error) {
        return res.status(post.statusCode ?? 404).json({
          name: post.name,
          message: post.message,
        });
      }
      if (post.clientId) {
        const client = await usersFactory().getUser.execute({
          clientId: post.clientId,
          advisorId: userId,
        });
        if (client instanceof Error) {
          return res.status(client.statusCode ?? 404).json({
            name: client.name,
            message: client.message,
          });
        }

        sseManager.broadcast(client.id, {
          type: `${status}_post`,
          post: post,
        });
      } else {
        const followers = await usersFactory().getUsersByRole.execute({
          userId: userId,
          role: "client",
        });
        if (followers instanceof Error) {
          return res.status(followers.statusCode ?? 404).json({
            name: followers.name,
            message: followers.message,
          });
        }
        followers.forEach((follower) => {
          sseManager.broadcast(follower.id, {
            type: `${status}_post`,
            post: post,
          });
        });
      }
      return res.json(post);
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { postId } = req.params;

      const result = await postsFactory().markPostAsRead.execute({
        userId: userId,
        postId,
      });

      if (result instanceof Error) {
        return res.status(result.statusCode ?? 404).json({
          name: result.name,
          message: result.message,
        });
      }

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
  static async ssePost(req: AuthRequest, res: Response, next: NextFunction) {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    console.log("🔑 User connecting with ID:", {
      userId,
      userIdType: typeof userId,
      userIdLength: userId.length,
    });

    // ✅ Configuration SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    // CORS si nécessaire
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // ✅ Message de connexion
    res.write(
      `data: ${JSON.stringify({
        type: "connected",
        timestamp: new Date(),
      })}\n\n`,
    );

    // ✅ Ajouter la connexion au manager
    sseManager.addConnection(userId, res);

    // ✅ Heartbeat toutes les 30 secondes
    const heartbeatInterval = setInterval(() => {
      try {
        res.write(": heartbeat\n\n");
        console.log(`💓 Heartbeat sent to user ${userId}`);
      } catch (error) {
        console.error(`❌ Heartbeat error for user ${userId}:`, error);
        clearInterval(heartbeatInterval);
        sseManager.removeConnection(userId);
      }
    }, 30000);

    // ✅ Cleanup lors de la déconnexion
    req.on("close", () => {
      clearInterval(heartbeatInterval);
      sseManager.removeConnection(userId);
      console.log(`🔌 User ${userId} disconnected from SSE`);
    });

    req.on("error", (error) => {
      console.error(`❌ Connection error for user ${userId}:`, error);
      clearInterval(heartbeatInterval);
      sseManager.removeConnection(userId);
    });
  }
}
