CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
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
