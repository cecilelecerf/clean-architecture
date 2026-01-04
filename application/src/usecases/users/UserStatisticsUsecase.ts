import {
  UserNotFoundError,
  UserNotActiveError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { ThreadRepository } from "@application/ports/repositories/ThreadRepository";
import { UserEntity } from "@domain/entities/UserEntity";

export type AdvisorStatistics = {
  acceptedCreditsCount: number;
  activeThreadsCount: number;
  refusedCreditsCount: number;
};

export type DirectorStatistics = {
  totalClients: number;
  totalAdvisors: number;
  totalActions: number;
};

type Props = {
  advisorId: string;
  actorId: string;
};

export class UserStatisticsUsecase {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly creditRepository: CreditRepository,
    private readonly threadRepository: ThreadRepository
  ) {}

  public async execute({
    advisorId,
    actorId,
  }: Props): Promise<
    | AdvisorStatistics
    | DirectorStatistics
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
  > {
    const advisor = await findActiveUser(this.userRepository, advisorId);
    if (advisor instanceof Error) return new UserNotFoundError();

    const actor = await findActiveUser(this.userRepository, actorId);
    if (actor instanceof Error) return new UserNotFoundError();

    const canView =
      actorId === advisorId || actor.hasRole({ role: "directeur" });

    if (!canView) {
      return new UserRoleMismatchError(["conseiller", "directeur"], actor.role);
    }
    if (advisor.hasRole({ role: "client" }))
      return new UserRoleMismatchError(
        ["conseiller", "directeur"],
        advisor.role
      );
    if (advisor.hasRole({ role: "conseiller" }))
      return this.advisorStat(advisorId);
    else return this.directorStat(advisorId);
  }
  private async advisorStat(
    advisorId: UserEntity["id"]
  ): Promise<AdvisorStatistics> {
    const acceptedCreditsCount =
      await this.creditRepository.countAcceptedByAdvisor(advisorId);
    const refusedCreditsCount =
      await this.creditRepository.countRefusedByAdvisor(advisorId);
    const activeThreadsCount = await this.threadRepository.countByAdvisor(
      advisorId
    );

    return {
      acceptedCreditsCount,
      activeThreadsCount,
      refusedCreditsCount,
    };
  }

  private async directorStat(
    advisorId: UserEntity["id"]
  ): Promise<DirectorStatistics> {
    const totalClients = await this.userRepository.countUserByRole("client");
    const totalAdvisors = await this.userRepository.countUserByRole(
      "conseiller"
    );

    return {
      totalClients,
      totalAdvisors,
      totalActions: 0,
    };
  }
}
