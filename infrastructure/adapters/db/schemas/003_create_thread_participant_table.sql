CREATE TABLE thread_participant (
    threadId VARCHAR(36),
    userId VARCHAR(36),
    PRIMARY KEY(threadId, userId),
    FOREIGN KEY(threadId) REFERENCES thread(id),
    FOREIGN KEY(userId) REFERENCES user(id)
);
