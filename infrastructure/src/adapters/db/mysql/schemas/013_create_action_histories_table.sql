CREATE TABLE IF NOT EXISTS action_price_history (
  id VARCHAR(36) PRIMARY KEY,
  isin VARCHAR(12) NOT NULL,
  date DATETIME NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  volume INT NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (isin) REFERENCES actions(isin) ON DELETE CASCADE,
  INDEX idx_isin_date (isin, date),
  INDEX idx_date (date)
)