CREATE TABLE IF NOT EXISTS credits (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    initial_amount DECIMAL(15,2) NOT NULL,
    initial_currency CHAR(3) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    insurance_rate DECIMAL(5,2) NOT NULL,
    duration_months INT NOT NULL,
    start_date DATETIME NOT NULL,
    monthly_amount DECIMAL(15,2) NOT NULL,
    monthly_currency CHAR(3) NOT NULL,
    remaining_amount DECIMAL(15,2) NOT NULL,
    remaining_currency CHAR(3) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
