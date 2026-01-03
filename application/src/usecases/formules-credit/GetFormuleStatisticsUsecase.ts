import { FormuleCreditRepository } from "@application/ports/repositories/FormuleCreditRepository";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { FormuleCreditNotFoundError } from "@application/errors/formules-credit";
import { CreditStatus } from "@domain/entities/CreditEntity";

export type FormuleStatistics = {
  activeCreditsCount: number;
  totalClients: number;
  acceptanceRate: number;
  pendingCreditsCount: number;
  totalLoanedAmount: number;
  totalInterestEarned: number;
  totalInsuranceEarned: number;
  totalRevenue: number;
  totalCreditsCount: number;
  acceptedCreditsCount: number;
  refusedCreditsCount: number;
};

type Props = {
  formuleId: string;
};

export class GetFormuleStatisticsUsecase {
  constructor(
    private readonly formuleCreditRepository: FormuleCreditRepository,
    private readonly creditRepository: CreditRepository
  ) {}

  async execute({
    formuleId,
  }: Props): Promise<FormuleStatistics | FormuleCreditNotFoundError> {
    const formule = await this.formuleCreditRepository.findById(formuleId);
    if (!formule) return new FormuleCreditNotFoundError();

    const [
      completedCreditsCount,
      pendingCreditsCount,
      totalCreditsCount,
      acceptedCreditsCount,
      refusedCreditsCount,
      totalClients,
      financialStats,
    ] = await Promise.all([
      this.creditRepository.countByFormuleAndStatus(
        formuleId,
        CreditStatus.COMPLETED
      ),
      this.creditRepository.countByFormuleAndStatus(
        formuleId,
        CreditStatus.PENDING
      ),
      this.creditRepository.countByFormule(formuleId),
      this.creditRepository.countByFormuleAndStatus(
        formuleId,
        CreditStatus.ACCEPTED
      ),
      this.creditRepository.countByFormuleAndStatus(
        formuleId,
        CreditStatus.REFUSED
      ),
      this.creditRepository.countClientsByFormule(formuleId),
      this.creditRepository.getFinancialStatsByFormule(formuleId),
    ]);
    const activeCreditsCount = acceptedCreditsCount + completedCreditsCount;
    const acceptanceRate =
      totalCreditsCount > 0
        ? Math.round((activeCreditsCount / totalCreditsCount) * 100)
        : 0;

    return {
      activeCreditsCount,
      totalClients,
      acceptanceRate,
      pendingCreditsCount,
      totalLoanedAmount: financialStats.totalLoanedAmount,
      totalInterestEarned: financialStats.totalInterestEarned,
      totalInsuranceEarned: financialStats.totalInsuranceEarned,
      totalRevenue: financialStats.totalRevenue,
      totalCreditsCount,
      acceptedCreditsCount,
      refusedCreditsCount,
    };
  }
}
