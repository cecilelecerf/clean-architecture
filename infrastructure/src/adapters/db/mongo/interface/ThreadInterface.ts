export interface ThreadInterface {
    participantsId: string[],
    title: string,
    createdAt: Date,
    isClose: boolean,
    type: "external" | "internal",
    administratorId: string,
    updatedAt: Date 
}