CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rank INT DEFAULT 0,
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
    loser_id INT DEFAULT 0
);