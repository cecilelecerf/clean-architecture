export interface MessageInterface{
    threadId: string,
    senderId: string,
    content: string,
    sentAt: Date,
    readBy: string[]
}