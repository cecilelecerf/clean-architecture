import { ClockService } from "@application/ports/services/ClockService";

export class SystemClockService implements ClockService {
  now(): Date {
    return new Date();
  }
}
