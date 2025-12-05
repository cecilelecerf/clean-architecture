CREATE TABLE IF NOT EXISTS threads (
    id VARCHAR(36) PRIMARY KEY,
<<<<<<< HEAD
    administrator_id VARCHAR(36),
=======
    administrator_id VARCHAR(36) NOT NULL,
>>>>>>> 2ce9cab (thread)
    title VARCHAR(50),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    is_close BOOLEAN DEFAULT 0,
    type ENUM('internal','external')
);
