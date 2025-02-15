CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rank INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'offline', -- 'offline', 'online', 'ingame'
    winrate FLOAT DEFAULT 0,
    total_wins INT DEFAULT 0,
    total_losses INT DEFAULT 0,
    total_games INT DEFAULT 0,
    is_2fa_enabled BOOLEAN DEFAULT FALSE,
    twofa_method VARCHAR(50) DEFAULT NULL,
    phone_number VARCHAR(255) DEFAULT NULL,
    temp_2fa_code VARCHAR(255) DEFAULT NULL,
    totp_secret VARCHAR(200) DEFAULT NULL,
    token_expiry TIMESTAMP DEFAULT NULL,
    session_token VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);


CREATE TABLE IF NOT EXISTS game_history (
    game_id SERIAL PRIMARY KEY,
    winner_id INT DEFAULT 0,
    loser_id INT DEFAULT 0,
    winner_score INT DEFAULT 0,
    loser_score INT DEFAULT 0
);


CREATE TABLE IF NOT EXISTS friends (
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'accepted', 'rejected'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, friend_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS blocks (
    user_id INT NOT NULL,
    blocked_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, blocked_user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_user_id) REFERENCES users(id) ON DELETE CASCADE
);
