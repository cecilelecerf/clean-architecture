CREATE TABLE IF NOT EXISTS threads (
    id VARCHAR(36) PRIMARY KEY,
    administrator_id VARCHAR(36) NOT NULL,
    title VARCHAR(50),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    is_close BOOLEAN DEFAULT 0,
    type ENUM('internal','external')
);
