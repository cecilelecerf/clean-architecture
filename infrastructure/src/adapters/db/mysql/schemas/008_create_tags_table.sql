CREATE TABLE IF NOT EXISTS tags (
    id VARCHAR(36) PRIMARY KEY,
    label VARCHAR(50) NOT NULL,
    color ENUM('blue','red','pink','yellow') NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME
);