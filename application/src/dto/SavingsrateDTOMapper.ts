import { SavingsRateDTO, SavingsRateEntity } from "@domain/entities/SavingsRateEntity";

export class SavingsRateDTOMapper {
  static toDTO(entity: SavingsRateEntity): SavingsRateDTO {
    return {
      id: entity.id,
      rate: entity.rate.value,
      effectiveDate: entity.effectiveDate,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
