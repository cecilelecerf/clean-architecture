CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(36) PRIMARY KEY,
    advisor_id VARCHAR(36) NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    modified_at DATETIME,
    published_at DATETIME,
    client_id VARCHAR(36),
    FOREIGN KEY (advisor_id) REFERENCES users(id),
    FOREIGN KEY (client_id) REFERENCES users(id)
);