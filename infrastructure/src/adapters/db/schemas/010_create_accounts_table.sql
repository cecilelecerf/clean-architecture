CREATE TABLE IF NOT EXISTS accounts (
    iban VARCHAR(34) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    color ENUM('blue','red','pink','yellow') NOT NULL,
    currency CHAR(3) NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME,
    CONSTRAINT fk_accounts_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);