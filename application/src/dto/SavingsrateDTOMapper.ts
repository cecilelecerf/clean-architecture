import { SavingsRateDTO, SavingsRateEntity } from "@domain/entities/SavingsRateEntity";

export class SavingsRateDTOMapper {
  static map(entity: SavingsRateEntity): SavingsRateDTO {
    return {
      id: entity.id,
      rate: entity.rate.value,
      effectiveDate: entity.effectiveDate,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
