CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    actionId VARCHAR(12) NOT NULL,
    type ENUM('buy','sell') NOT NULL,
    quantity INT NOT NULL,
    priceAmount DECIMAL(15,2) NOT NULL,
    priceCurrency CHAR(3) DEFAULT 'EUR',
    feeAmount DECIMAL(15,2) NOT NULL,
    feeCurrency CHAR(3) DEFAULT 'EUR',
    date DATETIME NOT NULL,
    status ENUM('pending','executed','cancelled') NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    modifiedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_action FOREIGN KEY (actionId) REFERENCES actions(ISIN) ON DELETE CASCADE
);
