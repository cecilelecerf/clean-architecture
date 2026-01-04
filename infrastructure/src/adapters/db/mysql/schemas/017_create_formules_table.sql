CREATE TABLE IF NOT EXISTS formules (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    interest_rate DECIMAL(5,2) NOT NULL,
    insurance_rate DECIMAL(5,2) NOT NULL,
    type VARCHAR(55) NOT NULL,
    label VARCHAR(55) NOT NULL,
    description VARCHAR(255) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    account_id VARCHAR(34) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    min_amount INT NULL DEFAULT 0,
    max_amount INT NULL DEFAULT 0,
    currency CHAR(3) NULL,

    FOREIGN KEY (account_id) REFERENCES accounts(iban) ON DELETE CASCADE
)