import { JwtTokenService } from "@infrastructure/adapters/services/JwtTokenService";
import { LogoutUsecase } from "@application/usecases/users/LogoutUsecase";

export const logoutFactory = () => {
  const tokenService = new JwtTokenService();
  return new LogoutUsecase(tokenService);
};
