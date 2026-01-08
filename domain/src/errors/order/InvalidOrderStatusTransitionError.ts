export class InvalidOrderStatusTransitionError extends Error {
  public readonly statusCode = 400;

  constructor(
    public readonly orderId: string,
    public readonly currentStatus: string,
    public readonly requiredStatus: string
  ) {
    super(
      `Cannot transition order ${orderId} from status "${currentStatus}". Required status is "${requiredStatus}".`
    );
    this.name = "InvalidOrderStatusTransitionError";
  }
}
