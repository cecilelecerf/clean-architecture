CREATE TABLE IF NOT EXISTS notifications (
    id CHAR(36) NOT NULL PRIMARY KEY,
    advisor_id CHAR(36) NOT NULL,
    client_id CHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    type ENUM('info', 'alert', 'reminder') NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    
    CONSTRAINT fk_notifications_advisor FOREIGN KEY (advisor_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_client FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);
