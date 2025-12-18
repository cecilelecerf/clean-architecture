CREATE TABLE IF NOT EXISTS accounts (
    iban VARCHAR(34) PRIMARY KEY,
    role ENUM('bank','client') NOT NULL,
    user_id VARCHAR(36) NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    color ENUM('blue','red','pink','yellow') NOT NULL,
    currency CHAR(3) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);