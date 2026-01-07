import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { postsFactory } from "@infrastructure/adapters/db/mongo/factories/posts";
import { postSchema, newPostSchema, publishActionSchema } from '@infrastructure/types/feed';
import { queryPostSchema } from '@infrastructure/types/pagination';

export class PostsController {
    static async getWithFilter(req: AuthRequest, res: Response, next: NextFunction){
        try{
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const paramsObj: Record<string, string | boolean | number | string[]> = {};

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

    static async add(req: AuthRequest, res: Response, next: NextFunction){
        try{
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const payload = newPostSchema.parse(req.body);
            const result = await postsFactory().addPost.execute({
                advisorId: userId,
                title: payload.title,
                content: payload.content,
                tagsId: payload.tagsId,
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

    static async getUnreadWithTag(req: AuthRequest, res: Response, next: NextFunction){
        try{
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const result = await postsFactory().getUnreadPostWithTag.execute({clientId: userId});

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

    static async getByIdWithTags(req: AuthRequest, res: Response, next: NextFunction){
        try{
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

    static async edit(req: AuthRequest, res: Response, next: NextFunction){
        try{
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

    static async delete(req: AuthRequest, res: Response, next: NextFunction){
        try{
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

    static async updateStatus(req: AuthRequest, res: Response, next: NextFunction){
        try{
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const { postId } = req.params;
            const { status } = publishActionSchema.parse(req.body);

            const result = await postsFactory().updatePostStatusPost.execute({
                userId: userId,
                postId: postId,
                status: status === 'publish',
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

    static async markAsRead(req: AuthRequest, res: Response, next: NextFunction){
        try{
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
}