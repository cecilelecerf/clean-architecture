CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    action_id VARCHAR(12) NOT NULL,
    type ENUM('buy','sell') NOT NULL,
    quantity INT NOT NULL,
    price_amount DECIMAL(15,2) NOT NULL,
    price_currency CHAR(3) DEFAULT 'EUR',
    fee_amount DECIMAL(15,2) NOT NULL,
    fee_currency CHAR(3) DEFAULT 'EUR',
    order_date DATETIME NOT NULL,
    status ENUM('pending','executed','cancelled') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_action FOREIGN KEY (action_id) REFERENCES actions(ISIN) ON DELETE CASCADE
);
