-- SQL initialization script for PostgreSQL
-- Creation de la base de données et de la table 'users'
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,                 -- Identifiant unique pour chaque utilisateur
    username VARCHAR(50) NOT NULL UNIQUE,  -- Nom d’utilisateur unique
    email VARCHAR(100) NOT NULL UNIQUE,    -- Email unique pour l'utilisateur
    password VARCHAR(255) NOT NULL,        -- Mot de passe haché
    is_2fa_enabled BOOLEAN DEFAULT FALSE,  -- Indique si la 2FA est activée
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Date de création du compte
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Date de la dernière mise à jour
);

-- Indice pour la recherche rapide par email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insertion d'un utilisateur d'exemple
INSERT INTO users (username, email, password, is_2fa_enabled)
VALUES ('exampleuser', 'example@example.com', '$2b$10$abcdefghijklmnopqrstuv', false);
