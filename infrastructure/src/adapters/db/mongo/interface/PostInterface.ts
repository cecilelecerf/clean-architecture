export interface PostInterface {
    advisorId: string,
    title: string,
    content: string,
    tagsId: string[],
    createdAt: Date,
    readBy: string[],
    modifiedAt: Date,
    publishedAt: Date,
    clientId: string[]
}