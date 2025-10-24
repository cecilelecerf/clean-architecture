CREATE TABLE threads (
    id VARCHAR(36) PRIMARY KEY,
    administratorId VARCHAR(36) NOT NULL,
    title VARCHAR(50),
    createdAt DATETIME NOT NULL,
    isClose BOOLEAN DEFAULT 0,
    type ENUM('internal','external')
);
