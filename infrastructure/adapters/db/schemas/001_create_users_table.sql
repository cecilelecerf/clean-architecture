CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    firstname VARCHAR(50),
    lastname VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    passwordHash VARCHAR(255),
    role ENUM('client','conseiller','directeur'),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt DATETIME NOT NULL
);
