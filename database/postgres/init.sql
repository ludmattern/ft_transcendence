CREATE TABLE
	IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		username VARCHAR(50) NOT NULL UNIQUE CHECK (LENGTH(username) >=6 AND LENGTH(username) <= 20 AND username ~ '^[a-zA-Z0-9_]+$'),
        email VARCHAR(255) DEFAULT NULL ,
		password VARCHAR(255) ,
		rank INT DEFAULT 0,
		tournament_status VARCHAR(20) DEFAULT 'out',
		winrate FLOAT DEFAULT 0,
		total_wins INT DEFAULT 0,
		total_losses INT DEFAULT 0,
		elo INT DEFAULT 0,
		is_connected BOOLEAN DEFAULT FALSE,
		total_games INT DEFAULT 0,
		profile_picture VARCHAR(255) DEFAULT 'profile_pics/default-profile-150.png',
		is_2fa_enabled BOOLEAN DEFAULT FALSE,
		is_dummy BOOLEAN DEFAULT FALSE,
		current_tournament_id INT DEFAULT 0,
		twofa_method VARCHAR(50) DEFAULT NULL,
		phone_number VARCHAR(255) DEFAULT NULL,
		temp_2fa_code VARCHAR(255) DEFAULT NULL,
		temp_reset_code VARCHAR(255) DEFAULT NULL,
		reset_code_expiry TIMESTAMP DEFAULT NULL,
		totp_secret VARCHAR(200) DEFAULT NULL,
		oauth_id VARCHAR(255) UNIQUE DEFAULT NULL,
		token_expiry TIMESTAMP DEFAULT NULL,
		session_token VARCHAR(255) DEFAULT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		alias VARCHAR(20) DEFAULT NULL
	);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users (phone_number);

CREATE TABLE
	IF NOT EXISTS game_history (
		id SERIAL PRIMARY KEY,
		winner_id INT DEFAULT 0,
		loser_id INT DEFAULT 0,
		winner_score INT DEFAULT 0,
		loser_score INT DEFAULT 0,
		created_at TIMESTAMP NOT NULL DEFAULT NOW ()
	);

CREATE TABLE
	IF NOT EXISTS friends (
		id SERIAL PRIMARY KEY, -- Django requires a primary key
		user_id INT NOT NULL,
		friend_id INT NOT NULL,
		initiator_id INT NOT NULL, -- Ajout de la colonne pour l'initiateur de la demande
		status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
		created_at TIMESTAMP NOT NULL DEFAULT NOW (),
		FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
		FOREIGN KEY (friend_id) REFERENCES users (id) ON DELETE CASCADE,
		UNIQUE (user_id, friend_id) -- Ensures no duplicate friendships
	);

CREATE TABLE
	IF NOT EXISTS blocks (
		id SERIAL PRIMARY KEY,
		user_id INT NOT NULL,
		blocked_user_id INT NOT NULL,
		created_at TIMESTAMP NOT NULL DEFAULT NOW (),
		initiator_id INT NOT NULL, -- The user who initiated the block
		FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
		FOREIGN KEY (blocked_user_id) REFERENCES users (id) ON DELETE CASCADE,
		UNIQUE (user_id, blocked_user_id) -- Ensures no duplicate blocks
	);

CREATE TABLE
	IF NOT EXISTS tournaments (
		id SERIAL PRIMARY KEY,
		serial_key VARCHAR(255) NOT NULL UNIQUE, -- Unique identifier for the tournament
		size INT DEFAULT 0 CHECK (size = 2 OR size = 4 OR size = 8),
		name VARCHAR(255) DEFAULT 'TOURNAMENT_DEFAULT_NAME',
		organizer_id INT DEFAULT NULL,
		status VARCHAR(50) DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'completed'
		mode VARCHAR(10) DEFAULT 'local',
		created_at TIMESTAMP NOT NULL DEFAULT NOW (),
		updated_at TIMESTAMP NOT NULL DEFAULT NOW ()
	);

CREATE TABLE
	IF NOT EXISTS tournament_participants (
		id SERIAL PRIMARY KEY,
		tournament_id INT NOT NULL,
		user_id INT NOT NULL,
		status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'eliminated'
		created_at TIMESTAMP NOT NULL DEFAULT NOW (),
		FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE,
		UNIQUE (tournament_id, user_id) -- Ensures no duplicate entries
	);

CREATE TABLE
	IF NOT EXISTS private_games (
		id SERIAL PRIMARY KEY, -- Django requires a primary key
		user_id INT NOT NULL,
		recipient_id INT NOT NULL,
		initiator_id INT NOT NULL, -- Ajout de la colonne pour l'initiateur de la demande
		status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
		created_at TIMESTAMP NOT NULL DEFAULT NOW (),
		FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
		FOREIGN KEY (recipient_id) REFERENCES users (id) ON DELETE CASCADE,
		UNIQUE (user_id, recipient_id) -- Ensures no duplicate friendships
	);

CREATE TABLE
	IF NOT EXISTS service_tournamentmatch (
		id SERIAL PRIMARY KEY,
		tournament_id INT NOT NULL,
		round_number INT NOT NULL,
		match_order INT NOT NULL,
		player1 VARCHAR(50),
		player2 VARCHAR(50),
		status VARCHAR(20) DEFAULT 'pending',
		winner VARCHAR(50),
		score VARCHAR(20),
		match_key VARCHAR(100),
		created_at TIMESTAMP NOT NULL DEFAULT NOW (),
		FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE
	);

INSERT INTO
	users (username, email, password, is_dummy, alias)
VALUES
	('dummyusera', 'a@dummy.com', 'aP@ssword1', true, 'dummyusera'),
	('dummyuserb', 'b@dummy.com', 'bP@ssword1', true, 'dummyuserb'),
	('dummyuserc', 'c@dummy.com', 'cP@ssword1', true, 'dummyuserc'),
	('dummyuserd', 'd@dummy.com', 'dP@ssword1', true , 'dummyuserd'),
	('dummyusere', 'e@dummy.com', 'eP@ssword1', true  ,'dummyusere'),
	('dummyuserf', 'f@dummy.com', 'fP@ssword1', true , 'dummyuserf'),
	('dummyuserg', 'g@dummy.com', 'gP@ssword1', true  ,'dummyuserg'),
	('dummyuserh', 'h@dummy.com', 'hP@ssword1', true , 'dummyuserh'),
	('dummyuseri', 'i@dummy.com', 'iP@ssword1', true , 'dummyuseri'),
	('dummyuserj', 'j@dummy.com', 'jP@ssword1', true  ,'dummyuserj'),
	('dummyuserk', 'k@dummy.com', 'kP@ssword1', true , 'dummyuserk'),
	('dummyuserl', 'l@dummy.com', 'lP@ssword1', true , 'dummyuserl'),
	('dummyuserm', 'm@dummy.com', 'mP@ssword1', true , 'dummyuserm'),
	('dummyusern', 'n@dummy.com', 'nP@ssword1', true,  'dummyusern'),
	('dummyusero', 'o@dummy.com', 'oP@ssword1', true , 'dummyusero'),
	('dummyuserp', 'p@dummy.com', 'pP@ssword1', true , 'dummyuserp'),
	('dummyuserq', 'q@dummy.com', 'qP@ssword1', true , 'dummyuserq'),
	('dummyuserr', 'r@dummy.com', 'rP@ssword1', true , 'dummyuserr'),
	('dummyusers', 's@dummy.com', 'sP@ssword1', true , 'dummyusers'),
	('dummyusert', 't@dummy.com', 'tP@ssword1', true , 'dummyusert'),
	('dummyuseru', 'u@dummy.com', 'uP@ssword1', true , 'dummyuseru');
