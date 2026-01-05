CREATE TABLE IF NOT EXISTS currencies (
  code VARCHAR(3) PRIMARY KEY,
  exchange_rate DECIMAL(10, 6) NOT NULL COMMENT 'Taux par rapport au USD (USD = 1.0)',
  created_at DATETIME NOT NULL,
  updated_at DATETIME,
  INDEX idx_code (code)
)