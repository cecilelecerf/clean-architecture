import { ClockService } from "@application/ports/services/ClockService";
import {
  RealTimeEvent,
  RealTimeService,
} from "@application/ports/services/RealTimeService";
import { Server } from "socket.io";

export class SocketIORealTimeService implements RealTimeService {
  constructor(
    private readonly io: Server,
    private readonly clockService: ClockService
  ) {}
  /**
   * Envoie un événement en temps réel à un ou plusieurs utilisateurs
   */
  async emitUsers(event: RealTimeEvent): Promise<void> {
    const { to, type, payload } = event;

    const sendAt = this.clockService.now();
    for (const userId of to) {
      this.io.to(userId).emit(type, { ...payload, sendAt });
    }
  }

  /**
   * Envoie un événement en temps réel à une room
   */
  async emitRooms(
    event: Omit<RealTimeEvent, "to"> & { rooms: string[] }
  ): Promise<void> {
    const { rooms, type, payload } = event;

    const sendAt = this.clockService.now();

    for (const room of rooms) {
      this.io.to(room).emit(type, { ...payload, sendAt });
    }
  }

  /**
   * Diffuse un événement à tout le monde
   */
  async broadcast(event: RealTimeEvent): Promise<void> {
    const { type, payload } = event;

    const sendAt = this.clockService.now();

    this.io.emit(type, { ...payload, sendAt });
  }
}
