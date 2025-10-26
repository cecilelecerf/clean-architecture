import { v4 as uuidv4 } from "uuid";
import { UuidService } from "@application/ports/services/UuidService";

export class NodeUuidService implements UuidService {
  generate(): string {
    return uuidv4();
  }
}
