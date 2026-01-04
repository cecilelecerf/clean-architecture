CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    account_iban VARCHAR(36) NOT NULL,
    action_id VARCHAR(12) NOT NULL,
    type ENUM('buy','sell') NOT NULL,
    quantity INT NOT NULL,
    price_amount DECIMAL(15,2) NOT NULL,
    price_currency CHAR(3) DEFAULT 'EUR',
    fee_amount DECIMAL(15,2) NOT NULL,
    fee_currency CHAR(3) DEFAULT 'EUR',
    date DATETIME NOT NULL,
    status ENUM('pending','executed','cancelled') NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    transaction_id VARCHAR(36) NOT NULL,
    
    CONSTRAINT fk_account FOREIGN KEY (account_iban) REFERENCES accounts(iban) ON DELETE CASCADE,
    CONSTRAINT fk_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    CONSTRAINT fk_action FOREIGN KEY (action_id) REFERENCES actions(ISIN) ON DELETE CASCADE
);
