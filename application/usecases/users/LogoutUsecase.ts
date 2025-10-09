import { TokenService } from "@application/ports/services/TokenService";

type Props = {
  token: string;
};

export class LogoutUsecase {
  constructor(private readonly tokenService: TokenService) {}

  public async execute({ token }: Props): Promise<void> {
    await this.tokenService.invalidateToken(token);
  }
}
