CREATE TABLE IF NOT EXISTS thread_participant (
    threadId VARCHAR(36),
    userId VARCHAR(36),
    PRIMARY KEY(threadId, userId),
    FOREIGN KEY(threadId) REFERENCES threads(id),
    FOREIGN KEY(userId) REFERENCES users(id)
);
