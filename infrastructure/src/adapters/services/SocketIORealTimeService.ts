import { ClockService } from "@application/ports/services/ClockService";
import {
  RealTimeEvent,
  RealTimeService,
} from "@application/ports/services/RealTimeService";
import { Server, Socket } from "socket.io";

export class SocketIORealTimeService implements RealTimeService {
  constructor(
    // Serveur Websocket en general
    private readonly io: Server,
    // Connexion avec un client
    private readonly socket: Socket,
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
  async emitRoom(
    event: Omit<RealTimeEvent, "to"> & { room: string }
  ): Promise<void> {
    const { room, type, payload, sentAt } = event;

    this.io.to(room).emit(type, { ...payload, sentAt });
  }

  /**
   * Diffuse un événement à tout le monde
   */
  async broadcast(event: RealTimeEvent): Promise<void> {
    const { type, payload } = event;

    const sendAt = this.clockService.now();

    this.io.emit(type, { ...payload, sendAt });
  }

  /**
   * Rejoins une room
   */
  async joinRoom({ room }: { room: string }): Promise<void> {
    this.io.socketsJoin(room);
  }

  /**
   * Exit une room
   */
  leaveRoom({ room }: { room: string }): void {
    this.socket.leave(room);
  }
}
