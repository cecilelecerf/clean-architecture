CREATE TABLE IF NOT EXISTS credits (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    initialAmount DECIMAL(15,2) NOT NULL,
    initialCurrency CHAR(3) NOT NULL,
    interestRate DECIMAL(5,2) NOT NULL,
    insuranceRate DECIMAL(5,2) NOT NULL,
    durationMonths INT NOT NULL,
    startDate DATETIME NOT NULL,
    monthlyAmount DECIMAL(15,2) NOT NULL,
    monthlyCurrency CHAR(3) NOT NULL,
    remainingAmount DECIMAL(15,2) NOT NULL,
    remainingCurrency CHAR(3) NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);