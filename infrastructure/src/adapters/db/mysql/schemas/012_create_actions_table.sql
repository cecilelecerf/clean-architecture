CREATE TABLE IF NOT EXISTS actions (
  isin CHAR(12) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  market VARCHAR(50) NOT NULL,
  activity_sector VARCHAR(50) NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  currency CHAR(3) NOT NULL,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL,
  default_quantity INT,
  updated_at DATETIME NOT NULL
) 
