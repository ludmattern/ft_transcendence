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
		size INT DEFAULT 0 CHECK (size == 4 OR size == 8 OR size == 16),
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
	('a', 'a@dummy.com', 'aP@ssword1', true),
	('b', 'b@dummy.com', 'bP@ssword1', true),
	('c', 'c@dummy.com', 'cP@ssword1', true),
	('d', 'd@dummy.com', 'dP@ssword1', true),
	('e', 'e@dummy.com', 'eP@ssword1', true),
	('f', 'f@dummy.com', 'fP@ssword1', true),
	('g', 'g@dummy.com', 'gP@ssword1', true),
	('h', 'h@dummy.com', 'hP@ssword1', true),
	('i', 'i@dummy.com', 'iP@ssword1', true),
	('j', 'j@dummy.com', 'jP@ssword1', true),
	('k', 'k@dummy.com', 'kP@ssword1', true),
	('l', 'l@dummy.com', 'lP@ssword1', true),
	('m', 'm@dummy.com', 'mP@ssword1', true),
	('n', 'n@dummy.com', 'nP@ssword1', true),
	('o', 'o@dummy.com', 'oP@ssword1', true),
	('p', 'p@dummy.com', 'pP@ssword1', true),
	('q', 'q@dummy.com', 'qP@ssword1', true),
	('r', 'r@dummy.com', 'rP@ssword1', true),
	('s', 's@dummy.com', 'sP@ssword1', true),
	('t', 't@dummy.com', 'tP@ssword1', true),
	('u', 'u@dummy.com', 'uP@ssword1', true),
	('v', 'v@dummy.com', 'vP@ssword1', true),
	('w', 'w@dummy.com', 'wP@ssword1', true),
	('x', 'x@dummy.com', 'xP@ssword1', true),
	('y', 'y@dummy.com', 'yP@ssword1', true),
	('z', 'z@dummy.com', 'zP@ssword1', true),
	('aa', 'aa@dummy.com', 'aaP@ssword1', true),
	('ab', 'ab@dummy.com', 'abP@ssword1', true),
	('ac', 'ac@dummy.com', 'acP@ssword1', true),
	('ad', 'ad@dummy.com', 'adP@ssword1', true),
	('ae', 'ae@dummy.com', 'aeP@ssword1', true),
	('af', 'af@dummy.com', 'afP@ssword1', true),
	('ag', 'ag@dummy.com', 'agP@ssword1', true),
	('ah', 'ah@dummy.com', 'ahP@ssword1', true),
	('ai', 'ai@dummy.com', 'aiP@ssword1', true),
	('aj', 'aj@dummy.com', 'ajP@ssword1', true),
	('ak', 'ak@dummy.com', 'akP@ssword1', true),
	('al', 'al@dummy.com', 'alP@ssword1', true),
	('am', 'am@dummy.com', 'amP@ssword1', true),
	('an', 'an@dummy.com', 'anP@ssword1', true),
	('ao', 'ao@dummy.com', 'aoP@ssword1', true),
	('ap', 'ap@dummy.com', 'apP@ssword1', true),
	('aq', 'aq@dummy.com', 'aqP@ssword1', true),
	('ar', 'ar@dummy.com', 'arP@ssword1', true),
	('as', 'as@dummy.com', 'asP@ssword1', true),
	('at', 'at@dummy.com', 'atP@ssword1', true),
	('au', 'au@dummy.com', 'auP@ssword1', true),
	('av', 'av@dummy.com', 'avP@ssword1', true),
	('aw', 'aw@dummy.com', 'awP@ssword1', true),
	('ax', 'ax@dummy.com', 'axP@ssword1', true),
	('ay', 'ay@dummy.com', 'ayP@ssword1', true),
	('az', 'az@dummy.com', 'azP@ssword1', true),
	('ba', 'ba@dummy.com', 'baP@ssword1', true),
	('bb', 'bb@dummy.com', 'bbP@ssword1', true),
	('bc', 'bc@dummy.com', 'bcP@ssword1', true),
	('bd', 'bd@dummy.com', 'bdP@ssword1', true),
	('be', 'be@dummy.com', 'beP@ssword1', true),
	('bf', 'bf@dummy.com', 'bfP@ssword1', true),
	('bg', 'bg@dummy.com', 'bgP@ssword1', true),
	('bh', 'bh@dummy.com', 'bhP@ssword1', true),
	('bi', 'bi@dummy.com', 'biP@ssword1', true),
	('bj', 'bj@dummy.com', 'bjP@ssword1', true),
	('bk', 'bk@dummy.com', 'bkP@ssword1', true),
	('bl', 'bl@dummy.com', 'blP@ssword1', true),
	('bm', 'bm@dummy.com', 'bmP@ssword1', true),
	('bn', 'bn@dummy.com', 'bnP@ssword1', true),
	('bo', 'bo@dummy.com', 'boP@ssword1', true),
	('bp', 'bp@dummy.com', 'bpP@ssword1', true),
	('bq', 'bq@dummy.com', 'bqP@ssword1', true),
	('br', 'br@dummy.com', 'brP@ssword1', true),
	('bs', 'bs@dummy.com', 'bsP@ssword1', true),
	('bt', 'bt@dummy.com', 'btP@ssword1', true),
	('bu', 'bu@dummy.com', 'buP@ssword1', true),
	('bv', 'bv@dummy.com', 'bvP@ssword1', true),
	('bw', 'bw@dummy.com', 'bwP@ssword1', true),
	('bx', 'bx@dummy.com', 'bxP@ssword1', true),
	('by', 'by@dummy.com', 'byP@ssword1', true),
	('bz', 'bz@dummy.com', 'bzP@ssword1', true),
	('ca', 'ca@dummy.com', 'caP@ssword1', true),
	('cb', 'cb@dummy.com', 'cbP@ssword1', true),
	('cc', 'cc@dummy.com', 'ccP@ssword1', true),
	('cd', 'cd@dummy.com', 'cdP@ssword1', true),
	('ce', 'ce@dummy.com', 'ceP@ssword1', true),
	('cf', 'cf@dummy.com', 'cfP@ssword1', true),
	('cg', 'cg@dummy.com', 'cgP@ssword1', true),
	('ch', 'ch@dummy.com', 'chP@ssword1', true),
	('ci', 'ci@dummy.com', 'ciP@ssword1', true),
	('cj', 'cj@dummy.com', 'cjP@ssword1', true),
	('ck', 'ck@dummy.com', 'ckP@ssword1', true),
	('cl', 'cl@dummy.com', 'clP@ssword1', true),
	('cm', 'cm@dummy.com', 'cmP@ssword1', true),
	('cn', 'cn@dummy.com', 'cnP@ssword1', true),
	('co', 'co@dummy.com', 'coP@ssword1', true),
	('cp', 'cp@dummy.com', 'cpP@ssword1', true),
	('cq', 'cq@dummy.com', 'cqP@ssword1', true),
	('cr', 'cr@dummy.com', 'crP@ssword1', true),
	('cs', 'cs@dummy.com', 'csP@ssword1', true),
	('ct', 'ct@dummy.com', 'ctP@ssword1', true),
	('cu', 'cu@dummy.com', 'cuP@ssword1', true),
	('cv', 'cv@dummy.com', 'cvP@ssword1', true),
	('cw', 'cw@dummy.com', 'cwP@ssword1', true),
	('cx', 'cx@dummy.com', 'cxP@ssword1', true),
	('cy', 'cy@dummy.com', 'cyP@ssword1', true),
	('cz', 'cz@dummy.com', 'czP@ssword1', true),
	('da', 'da@dummy.com', 'daP@ssword1', true),
	('db', 'db@dummy.com', 'dbP@ssword1', true),
	('dc', 'dc@dummy.com', 'dcP@ssword1', true),
	('dd', 'dd@dummy.com', 'ddP@ssword1', true),
	('de', 'de@dummy.com', 'deP@ssword1', true),
	('df', 'df@dummy.com', 'dfP@ssword1', true),
	('dg', 'dg@dummy.com', 'dgP@ssword1', true),
	('dh', 'dh@dummy.com', 'dhP@ssword1', true),
	('di', 'di@dummy.com', 'diP@ssword1', true),
	('dj', 'dj@dummy.com', 'djP@ssword1', true),
	('dk', 'dk@dummy.com', 'dkP@ssword1', true),
	('dl', 'dl@dummy.com', 'dlP@ssword1', true),
	('dm', 'dm@dummy.com', 'dmP@ssword1', true),
	('dn', 'dn@dummy.com', 'dnP@ssword1', true),
	('do', 'do@dummy.com', 'doP@ssword1', true),
	('dp', 'dp@dummy.com', 'dpP@ssword1', true),
	('dq', 'dq@dummy.com', 'dqP@ssword1', true),
	('dr', 'dr@dummy.com', 'drP@ssword1', true),
	('ds', 'ds@dummy.com', 'dsP@ssword1', true),
	('dt', 'dt@dummy.com', 'dtP@ssword1', true),
	('du', 'du@dummy.com', 'duP@ssword1', true),
	('dv', 'dv@dummy.com', 'dvP@ssword1', true),
	('dw', 'dw@dummy.com', 'dwP@ssword1', true),
	('dx', 'dx@dummy.com', 'dxP@ssword1', true),
	('dy', 'dy@dummy.com', 'dyP@ssword1', true),
	('dz', 'dz@dummy.com', 'dzP@ssword1', true),
	('ea', 'ea@dummy.com', 'eaP@ssword1', true),
	('eb', 'eb@dummy.com', 'ebP@ssword1', true),
	('ec', 'ec@dummy.com', 'ecP@ssword1', true),
	('ed', 'ed@dummy.com', 'edP@ssword1', true),
	('ee', 'ee@dummy.com', 'eeP@ssword1', true),
	('ef', 'ef@dummy.com', 'efP@ssword1', true),
	('eg', 'eg@dummy.com', 'egP@ssword1', true),
	('eh', 'eh@dummy.com', 'ehP@ssword1', true),
	('ei', 'ei@dummy.com', 'eiP@ssword1', true),
	('ej', 'ej@dummy.com', 'ejP@ssword1', true),
	('ek', 'ek@dummy.com', 'ekP@ssword1', true),
	('el', 'el@dummy.com', 'elP@ssword1', true),
	('em', 'em@dummy.com', 'emP@ssword1', true),
	('en', 'en@dummy.com', 'enP@ssword1', true),
	('eo', 'eo@dummy.com', 'eoP@ssword1', true),
	('ep', 'ep@dummy.com', 'epP@ssword1', true),
	('eq', 'eq@dummy.com', 'eqP@ssword1', true),
	('er', 'er@dummy.com', 'erP@ssword1', true),
	('es', 'es@dummy.com', 'esP@ssword1', true),
	('et', 'et@dummy.com', 'etP@ssword1', true),
	('eu', 'eu@dummy.com', 'euP@ssword1', true),
	('ev', 'ev@dummy.com', 'evP@ssword1', true),
	('ew', 'ew@dummy.com', 'ewP@ssword1', true),
	('ex', 'ex@dummy.com', 'exP@ssword1', true),
	('ey', 'ey@dummy.com', 'eyP@ssword1', true),
	('ez', 'ez@dummy.com', 'ezP@ssword1', true),
	('fa', 'fa@dummy.com', 'faP@ssword1', true),
	('fb', 'fb@dummy.com', 'fbP@ssword1', true);
	