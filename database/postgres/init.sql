CREATE TABLE
	IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		username VARCHAR(50) NOT NULL UNIQUE,
		email VARCHAR(255) DEFAULT NULL,
		password VARCHAR(255),
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
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
		size INT DEFAULT 0,
		name VARCHAR(255) DEFAULT 'TOURNAMENT_DEFAULT_NAME',
		organizer_id INT NOT NULL,
		status VARCHAR(50) DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'completed'
		mode VARCHAR(10) DEFAULT 'local',
		created_at TIMESTAMP NOT NULL DEFAULT NOW (),
		updated_at TIMESTAMP NOT NULL DEFAULT NOW (),
		FOREIGN KEY (organizer_id) REFERENCES users (id) ON DELETE CASCADE
	);

CREATE TABLE
	IF NOT EXISTS tournament_participants (
		id SERIAL PRIMARY KEY,
		tournament_id INT NOT NULL,
		user_id INT NOT NULL,
		status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'eliminated'
		created_at TIMESTAMP NOT NULL DEFAULT NOW (),
		FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE,
		FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
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
	IF NOT EXISTS notifications (
		id SERIAL PRIMARY KEY,
		sender_id INT NOT NULL,
		receiver_id INT NOT NULL,
		type VARCHAR(50) DEFAULT 'private_game', -- 'private_game', 'tournament_invite', 'tournament_turn'
		status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'expired'
		tournament_id INT DEFAULT NULL, -- Used for tournament-related notifications
		game_id INT DEFAULT NULL, -- Used for game invitations
		created_at TIMESTAMP NOT NULL DEFAULT NOW (),
		updated_at TIMESTAMP NOT NULL DEFAULT NOW (),
		FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
		FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE,
		FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE
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
	users (username, email, password, is_dummy)
VALUES
	('a', 'a@.com', 'a', true),
	('b', 'b@.com', 'b', true),
	('c', 'c@.com', 'c', true),
	('d', 'd@.com', 'd', true),
	('e', 'e@.com', 'e', true),
	('f', 'f@.com', 'f', true),
	('g', 'g@.com', 'g', true),
	('h', 'h@.com', 'h', true),
	('i', 'i@.com', 'i', true),
	('j', 'j@.com', 'j', true),
	('k', 'k@.com', 'k', true),
	('l', 'l@.com', 'l', true),
	('m', 'm@.com', 'm', true),
	('n', 'n@.com', 'n', true),
	('o', 'o@.com', 'o', true),
	('p', 'p@.com', 'p', true),
	('q', 'q@.com', 'q', true),
	('r', 'r@.com', 'r', true),
	('s', 's@.com', 's', true),
	('t', 't@.com', 't', true),
	('u', 'u@.com', 'u', true),
	('v', 'v@.com', 'v', true),
	('w', 'w@.com', 'w', true),
	('x', 'x@.com', 'x', true),
	('y', 'y@.com', 'y', true),
	('z', 'z@.com', 'z', true),
	('aa', 'aa@.com', 'aa', true),
	('ab', 'ab@.com', 'ab', true),
	('ac', 'ac@.com', 'ac', true),
	('ad', 'ad@.com', 'ad', true),
	('ae', 'ae@.com', 'ae', true),
	('af', 'af@.com', 'af', true),
	('ag', 'ag@.com', 'ag', true),
	('ah', 'ah@.com', 'ah', true),
	('ai', 'ai@.com', 'ai', true),
	('aj', 'aj@.com', 'aj', true),
	('ak', 'ak@.com', 'ak', true),
	('al', 'al@.com', 'al', true),
	('am', 'am@.com', 'am', true),
	('an', 'an@.com', 'an', true),
	('ao', 'ao@.com', 'ao', true),
	('ap', 'ap@.com', 'ap', true),
	('aq', 'aq@.com', 'aq', true),
	('ar', 'ar@.com', 'ar', true),
	('as', 'as@.com', 'as', true),
	('at', 'at@.com', 'at', true),
	('au', 'au@.com', 'au', true),
	('av', 'av@.com', 'av', true),
	('aw', 'aw@.com', 'aw', true),
	('ax', 'ax@.com', 'ax', true),
	('ay', 'ay@.com', 'ay', true),
	('az', 'az@.com', 'az', true),
	('ba', 'ba@.com', 'ba', true),
	('bb', 'bb@.com', 'bb', true),
	('bc', 'bc@.com', 'bc', true),
	('bd', 'bd@.com', 'bd', true),
	('be', 'be@.com', 'be', true),
	('bf', 'bf@.com', 'bf', true),
	('bg', 'bg@.com', 'bg', true),
	('bh', 'bh@.com', 'bh', true),
	('bi', 'bi@.com', 'bi', true),
	('bj', 'bj@.com', 'bj', true),
	('bk', 'bk@.com', 'bk', true),
	('bl', 'bl@.com', 'bl', true),
	('bm', 'bm@.com', 'bm', true),
	('bn', 'bn@.com', 'bn', true),
	('bo', 'bo@.com', 'bo', true),
	('bp', 'bp@.com', 'bp', true),
	('bq', 'bq@.com', 'bq', true),
	('br', 'br@.com', 'br', true),
	('bs', 'bs@.com', 'bs', true),
	('bt', 'bt@.com', 'bt', true),
	('bu', 'bu@.com', 'bu', true),
	('bv', 'bv@.com', 'bv', true),
	('bw', 'bw@.com', 'bw', true),
	('bx', 'bx@.com', 'bx', true),
	('by', 'by@.com', 'by', true),
	('bz', 'bz@.com', 'bz', true),
	('ca', 'ca@.com', 'ca', true),
	('cb', 'cb@.com', 'cb', true),
	('cc', 'cc@.com', 'cc', true),
	('cd', 'cd@.com', 'cd', true),
	('ce', 'ce@.com', 'ce', true),
	('cf', 'cf@.com', 'cf', true),
	('cg', 'cg@.com', 'cg', true),
	('ch', 'ch@.com', 'ch', true),
	('ci', 'ci@.com', 'ci', true),
	('cj', 'cj@.com', 'cj', true),
	('ck', 'ck@.com', 'ck', true),
	('cl', 'cl@.com', 'cl', true),
	('cm', 'cm@.com', 'cm', true),
	('cn', 'cn@.com', 'cn', true),
	('co', 'co@.com', 'co', true),
	('cp', 'cp@.com', 'cp', true),
	('cq', 'cq@.com', 'cq', true),
	('cr', 'cr@.com', 'cr', true),
	('cs', 'cs@.com', 'cs', true),
	('ct', 'ct@.com', 'ct', true),
	('cu', 'cu@.com', 'cu', true),
	('cv', 'cv@.com', 'cv', true),
	('cw', 'cw@.com', 'cw', true),
	('cx', 'cx@.com', 'cx', true),
	('cy', 'cy@.com', 'cy', true),
	('cz', 'cz@.com', 'cz', true),
	('da', 'da@.com', 'da', true),
	('db', 'db@.com', 'db', true),
	('dc', 'dc@.com', 'dc', true),
	('dd', 'dd@.com', 'dd', true),
	('de', 'de@.com', 'de', true),
	('df', 'df@.com', 'df', true),
	('dg', 'dg@.com', 'dg', true),
	('dh', 'dh@.com', 'dh', true),
	('di', 'di@.com', 'di', true),
	('dj', 'dj@.com', 'dj', true),
	('dk', 'dk@.com', 'dk', true),
	('dl', 'dl@.com', 'dl', true),
	('dm', 'dm@.com', 'dm', true),
	('dn', 'dn@.com', 'dn', true),
	('do', 'do@.com', 'do', true),
	('dp', 'dp@.com', 'dp', true),
	('dq', 'dq@.com', 'dq', true),
	('dr', 'dr@.com', 'dr', true),
	('ds', 'ds@.com', 'ds', true),
	('dt', 'dt@.com', 'dt', true),
	('du', 'du@.com', 'du', true),
	('dv', 'dv@.com', 'dv', true),
	('dw', 'dw@.com', 'dw', true),
	('dx', 'dx@.com', 'dx', true),
	('dy', 'dy@.com', 'dy', true),
	('dz', 'dz@.com', 'dz', true),
	('ea', 'ea@.com', 'ea', true),
	('eb', 'eb@.com', 'eb', true),
	('ec', 'ec@.com', 'ec', true),
	('ed', 'ed@.com', 'ed', true),
	('ee', 'ee@.com', 'ee', true),
	('ef', 'ef@.com', 'ef', true),
	('eg', 'eg@.com', 'eg', true),
	('eh', 'eh@.com', 'eh', true),
	('ei', 'ei@.com', 'ei', true),
	('ej', 'ej@.com', 'ej', true),
	('ek', 'ek@.com', 'ek', true),
	('el', 'el@.com', 'el', true),
	('em', 'em@.com', 'em', true),
	('en', 'en@.com', 'en', true),
	('eo', 'eo@.com', 'eo', true),
	('ep', 'ep@.com', 'ep', true),
	('eq', 'eq@.com', 'eq', true),
	('er', 'er@.com', 'er', true),
	('es', 'es@.com', 'es', true),
	('et', 'et@.com', 'et', true),
	('eu', 'eu@.com', 'eu', true),
	('ev', 'ev@.com', 'ev', true),
	('ew', 'ew@.com', 'ew', true),
	('ex', 'ex@.com', 'ex', true),
	('ey', 'ey@.com', 'ey', true),
	('ez', 'ez@.com', 'ez', true),
	('fa', 'fa@.com', 'fa', true),
	('fb', 'fb@.com', 'fb', true);