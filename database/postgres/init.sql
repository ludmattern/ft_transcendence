CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	username VARCHAR(50) NOT NULL UNIQUE,
	email VARCHAR(255) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL,
	rank INT DEFAULT 0,
	status VARCHAR(20) DEFAULT 'offline', -- 'offline', 'online', 'ingame'
	in_tournament BOOLEAN DEFAULT FALSE, -- Whether the user is currently in a tournament still active
	winrate FLOAT DEFAULT 0,
	total_wins INT DEFAULT 0,
	total_losses INT DEFAULT 0,
	total_games INT DEFAULT 0,
	is_2fa_enabled BOOLEAN DEFAULT FALSE,
	is_dummy BOOLEAN DEFAULT FALSE,
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
	id SERIAL PRIMARY KEY,  -- Django requires a primary key
	user_id INT NOT NULL,
	friend_id INT NOT NULL,
	initiator_id INT NOT NULL,  -- Ajout de la colonne pour l'initiateur de la demande
	status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'accepted', 'rejected'
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
	UNIQUE (user_id, friend_id) -- Ensures no duplicate friendships
);

CREATE TABLE IF NOT EXISTS blocks (
	id SERIAL PRIMARY KEY,
	user_id INT NOT NULL,
	blocked_user_id INT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (blocked_user_id) REFERENCES users(id) ON DELETE CASCADE,
	UNIQUE (user_id, blocked_user_id) -- Ensures no duplicate blocks
);

CREATE TABLE IF NOT EXISTS tournaments (
	id SERIAL PRIMARY KEY,
	serial_key VARCHAR(255) NOT NULL UNIQUE, -- Unique identifier for the tournament
	rounds INT DEFAULT 0,
	name VARCHAR(255) DEFAULT 'TOURNAMENT_DEFAULT_NAME',
	organizer_id INT NOT NULL,
	status VARCHAR(50) DEFAULT 'upcoming', -- 
	mode VARCHAR(10) DEFAULT 'local',
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
	FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tournament_participants (
	id SERIAL PRIMARY KEY,
	tournament_id INT NOT NULL,
	user_id INT NOT NULL,
	status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'eliminated'
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	UNIQUE (tournament_id, user_id) -- Ensures no duplicate entries
);

CREATE TABLE IF NOT EXISTS notifications (
	id SERIAL PRIMARY KEY,
	sender_id INT NOT NULL,
	receiver_id INT NOT NULL,
	type VARCHAR(50) DEFAULT 'private_game',  -- 'private_game', 'tournament_invite', 'tournament_turn'
	status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'expired'
	tournament_id INT DEFAULT NULL, -- Used for tournament-related notifications
	game_id INT DEFAULT NULL, -- Used for game invitations
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
	FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
	FOREIGN KEY (game_id) REFERENCES game_history(game_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS service_tournamentmatch (
	id SERIAL PRIMARY KEY,
	tournament_id INT NOT NULL,
	round_number INT NOT NULL,
	match_order INT NOT NULL,
	player1 VARCHAR(50),
	player2 VARCHAR(50),
	status VARCHAR(20) DEFAULT 'pending',
	winner VARCHAR(50),
	score VARCHAR(20),
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);


INSERT INTO users (
  username,
  email,
  password,
  is_dummy
) VALUES
  ('a', 'a@.com', 'a', true),
  ('b', 'b@.com', 'b', true),
  ('c', 'c@.com', 'c', true),
  ('d', 'd@.com', 'd', true);



