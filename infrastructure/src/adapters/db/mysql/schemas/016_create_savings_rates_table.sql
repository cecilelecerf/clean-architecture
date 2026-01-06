CREATE TABLE IF NOT EXISTS savings_rates (
    id VARCHAR(36) PRIMARY KEY,
    rate DECIMAL(5,2) NOT NULL,
    effective_date DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);
