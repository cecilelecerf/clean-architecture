CREATE TABLE IF NOT EXISTS thread_participant (
    thread_id VARCHAR(36),
    user_id VARCHAR(36),
    PRIMARY KEY(thread_id, user_id),
    FOREIGN KEY(thread_id) REFERENCES threads(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);
