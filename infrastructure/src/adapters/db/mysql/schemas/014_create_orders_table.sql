CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    account_iban VARCHAR(36) NOT NULL,
    action_isin VARCHAR(12) NOT NULL,
    type ENUM('buy','sell') NOT NULL,
    quantity INT NOT NULL,
    price_amount DECIMAL(15,2) NOT NULL,
    price_currency CHAR(3) DEFAULT 'EUR', 
    status ENUM('pending','executed','cancelled') NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    date DATETIME NULL,
    transaction_id VARCHAR(36),
    execution_price_amount DECIMAL(15,2),
    execution_price_currency CHAR(3), 
     
    CONSTRAINT fk_account FOREIGN KEY (account_iban) REFERENCES accounts(iban) ON DELETE CASCADE,
    CONSTRAINT fk_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    CONSTRAINT fk_action FOREIGN KEY (action_isin) REFERENCES actions(ISIN) ON DELETE CASCADE,
    
    INDEX idx_action_status (action_isin, status),
    INDEX idx_created_at (created_at)
);