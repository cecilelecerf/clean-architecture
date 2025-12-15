export interface UserInterface {
    firstname: string,
    lastname: string,
    email: string,
    passwordHash: string,
    role: "client" | "conseiller" | "directeur",
    isActiveField: boolean,
    createdAt: Date,
    confirmedAt: Date,
    modifiedAt: Date,
    advisorId: string
}