CREATE TABLE IF NOT EXISTS notifications (
    id CHAR(36) NOT NULL PRIMARY KEY,
    advisorId CHAR(36) NOT NULL,
    clientId CHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    createdAt DATETIME NOT NULL,
    isRead TINYINT(1) NOT NULL DEFAULT 0,
    type ENUM('info', 'alert', 'reminder') NOT NULL,
    CONSTRAINT fk_notifications_advisor FOREIGN KEY (advisorId) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_client FOREIGN KEY (clientId) REFERENCES users(id) ON DELETE CASCADE
) 
