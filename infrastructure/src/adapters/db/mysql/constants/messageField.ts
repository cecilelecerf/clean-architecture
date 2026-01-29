export const MESSAGE_FIELDS = [
  "id",
  "thread_id",
  "sender_id",
  "content",
  "sent_at",
] as const;

export const getMessageFields = (alias: string, prefix: string): string => {
  return MESSAGE_FIELDS.map(
    (field) => `${alias}.${field} AS ${prefix}${field}`,
  ).join(",\n        ");
};
