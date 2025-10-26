CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(36) PRIMARY KEY,
    advisorId VARCHAR(36) NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    createdAt DATETIME NOT NULL,
    modifiedAt DATETIME,
    publishedAt DATETIME,
    FOREIGN KEY (advisorId) REFERENCES users(id)
);