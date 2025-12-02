CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    from_account_id VARCHAR(34) NOT NULL,
    to_account_id VARCHAR(34) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    label VARCHAR(40) NOT NULL,
    icon VARCHAR(5),
    date DATETIME NOT NULL,
    type ENUM('credit','debit') NOT NULL,
    CONSTRAINT fk_transactions_from_account FOREIGN KEY (from_account_id) REFERENCES accounts(iban) ON DELETE CASCADE,
    CONSTRAINT fk_transactions_to_account FOREIGN KEY (to_account_id) REFERENCES accounts(iban) ON DELETE CASCADE
);