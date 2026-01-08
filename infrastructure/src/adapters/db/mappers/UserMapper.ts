import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";
import { RowDataPacket } from "mysql2/promise";

export class UserMapper {
  static mapRowToUser(row: RowDataPacket, prefix: string = ""): UserEntity {
    const email = Email.from(row[`${prefix}email`]);
    return UserEntity.from({
      id: row[`${prefix}id`],
      email: email,
      passwordHash: row[`${prefix}password_hash`],
      firstname: row[`${prefix}firstname`],
      lastname: row[`${prefix}lastname`],
      role: row[`${prefix}role`],
      isActiveField: Boolean(row[`${prefix}is_active`]),
      createdAt: row[`${prefix}created_at`],
      updatedAt: row[`${prefix}updated_at`],
      confirmedAt: row[`${prefix}confirmed_at`] ?? null,
      address: row[`${prefix}address`]
        ? {
            address: row[`${prefix}address`],
            city: row[`${prefix}city`],
            postalCode: row[`${prefix}postal_code`],
            country: row[`${prefix}country`],
          }
        : undefined,
      dateOfBirth: row[`${prefix}date_of_birth`] ?? undefined,
      sexe: row[`${prefix}sexe`] ?? undefined,
      phoneNumber: row[`${prefix}phone_number`] ?? undefined,
    });
  }
  static mapDocToUser(doc: any): UserEntity {
    const email = Email.from(doc.email);

    return UserEntity.from({
      id: doc._id.toString(),
      firstname: doc.firstname,
      lastname: doc.lastname,
      email,
      passwordHash: doc.passwordHash,
      role: doc.role,
      isActiveField: doc.isActive,
      sexe: doc.sexe,
      dateOfBirth: doc.dateOfBirth,
      address: {
        address: doc.address,
        city: doc.city,
        postalCode: doc.postalCode,
        country: doc.country,
      },
      phoneNumber: doc.phoneNumber,
      createdAt: doc.createdAt,
      confirmedAt: doc.confirmedAt ?? null,
      updatedAt: doc.updatedAt,
    });
  }
}
