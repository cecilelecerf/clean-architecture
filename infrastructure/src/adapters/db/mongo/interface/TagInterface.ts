import { Document } from "mongoose";

export interface TagInterface extends Document {
    label: string,
    color: string,
    createdAt: Date,
    updatedAt: Date 
}