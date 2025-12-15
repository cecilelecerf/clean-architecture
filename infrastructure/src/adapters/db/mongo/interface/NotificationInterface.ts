export interface NotificationInterface{
    advisorId: string,
    clientId: string,
    title: string,
    content: string,
    isRead: boolean,
    type: "info" | "alert" | "reminder",
    createdAt: Date,
    updatedAt: Date 
}