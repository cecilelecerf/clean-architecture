CREATE TABLE IF NOT EXISTS credits (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    account_id VARCHAR(34) NOT NULL,
    formule_id VARCHAR(36) NOT NULL,
    initial_amount DECIMAL(15,2) NOT NULL,
    initial_currency CHAR(3) NOT NULL,
    duration_months INT NOT NULL,
    start_date DATETIME NOT NULL,
    monthly_amount DECIMAL(15,2) NOT NULL,
    monthly_currency CHAR(3) NOT NULL,
    remaining_amount DECIMAL(15,2) NOT NULL,
    remaining_currency CHAR(3) NOT NULL,
    status ENUM("PENDING", "ACCEPTED", "REFUSED", "COMPLETED") NOT NULL,
    created_at DATETIME NOT NULL,
    advisor_id VARCHAR(36) NULL,
    updated_at DATETIME NOT NULL,
    reason VARCHAR(255) NULL,

    FOREIGN KEY (account_id) REFERENCES accounts(iban) ON DELETE CASCADE,
    FOREIGN KEY (formule_id) REFERENCES formules(id) ON DELETE CASCADE,
    FOREIGN KEY (advisor_id) REFERENCES users(id) ON DELETE CASCADE
);
