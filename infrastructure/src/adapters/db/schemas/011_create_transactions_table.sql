CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    fromAccountId VARCHAR(34) NOT NULL,
    toAccountId VARCHAR(34) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    label VARCHAR(40) NOT NULL,
    icon VARCHAR(5),
    date DATETIME NOT NULL,
    type ENUM('credit','debit') NOT NULL,
    CONSTRAINT fk_transactions_fromAccount FOREIGN KEY (fromAccountId) REFERENCES accounts(iban) ON DELETE CASCADE,
    CONSTRAINT fk_transactions_toAccount FOREIGN KEY (toAccountId) REFERENCES accounts(iban) ON DELETE CASCADE
);