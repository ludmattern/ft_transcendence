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
		size INT DEFAULT 0 CHECK (size = 2 OR size = 4 OR size = 8),
		name VARCHAR(255) DEFAULT 'TOURNAMENT_DEFAULT_NAME',
		organizer_id INT NOT NULL,
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
	users (username, email, password, is_dummy)
VALUES
	('dummyusera', 'a@dummy.com', 'aP@ssword1', true),
	('dummyuserb', 'b@dummy.com', 'bP@ssword1', true),
	('dummyuserc', 'c@dummy.com', 'cP@ssword1', true),
	('dummyuserd', 'd@dummy.com', 'dP@ssword1', true),
	('dummyusere', 'e@dummy.com', 'eP@ssword1', true),
	('dummyuserf', 'f@dummy.com', 'fP@ssword1', true),
	('dummyuserg', 'g@dummy.com', 'gP@ssword1', true),
	('dummyuserh', 'h@dummy.com', 'hP@ssword1', true),
	('dummyuseri', 'i@dummy.com', 'iP@ssword1', true),
	('dummyuserj', 'j@dummy.com', 'jP@ssword1', true),
	('dummyuserk', 'k@dummy.com', 'kP@ssword1', true),
	('dummyuserl', 'l@dummy.com', 'lP@ssword1', true),
	('dummyuserm', 'm@dummy.com', 'mP@ssword1', true),
	('dummyusern', 'n@dummy.com', 'nP@ssword1', true),
	('dummyusero', 'o@dummy.com', 'oP@ssword1', true),
	('dummyuserp', 'p@dummy.com', 'pP@ssword1', true),
	('dummyuserq', 'q@dummy.com', 'qP@ssword1', true),
	('dummyuserr', 'r@dummy.com', 'rP@ssword1', true),
	('dummyusers', 's@dummy.com', 'sP@ssword1', true),
	('dummyusert', 't@dummy.com', 'tP@ssword1', true),
	('dummyuseru', 'u@dummy.com', 'uP@ssword1', true),
	('dummyuserv', 'v@dummy.com', 'vP@ssword1', true),
	('dummyuserw', 'w@dummy.com', 'wP@ssword1', true),
	('dummyuserx', 'x@dummy.com', 'xP@ssword1', true),
	('dummyusery', 'y@dummy.com', 'yP@ssword1', true),
	('dummyuserz', 'z@dummy.com', 'zP@ssword1', true),
	('dummyuseraa', 'aa@dummy.com', 'aaP@ssword1', true),
	('dummyuserab', 'ab@dummy.com', 'abP@ssword1', true),
	('dummyuserac', 'ac@dummy.com', 'acP@ssword1', true),
	('dummyuserad', 'ad@dummy.com', 'adP@ssword1', true),
	('dummyuserae', 'ae@dummy.com', 'aeP@ssword1', true),
	('dummyuseraf', 'af@dummy.com', 'afP@ssword1', true),
	('dummyuserag', 'ag@dummy.com', 'agP@ssword1', true),
	('dummyuserah', 'ah@dummy.com', 'ahP@ssword1', true),
	('dummyuserai', 'ai@dummy.com', 'aiP@ssword1', true),
	('dummyuseraj', 'aj@dummy.com', 'ajP@ssword1', true),
	('dummyuserak', 'ak@dummy.com', 'akP@ssword1', true),
	('dummyuseral', 'al@dummy.com', 'alP@ssword1', true),
	('dummyuseram', 'am@dummy.com', 'amP@ssword1', true),
	('dummyuseran', 'an@dummy.com', 'anP@ssword1', true),
	('dummyuserao', 'ao@dummy.com', 'aoP@ssword1', true),
	('dummyuserap', 'ap@dummy.com', 'apP@ssword1', true),
	('dummyuseraq', 'aq@dummy.com', 'aqP@ssword1', true),
	('dummyuserar', 'ar@dummy.com', 'arP@ssword1', true),
	('dummyuseras', 'as@dummy.com', 'asP@ssword1', true),
	('dummyuserat', 'at@dummy.com', 'atP@ssword1', true),
	('dummyuserau', 'au@dummy.com', 'auP@ssword1', true),
	('dummyuserav', 'av@dummy.com', 'avP@ssword1', true),
	('dummyuseraw', 'aw@dummy.com', 'awP@ssword1', true),
	('dummyuserax', 'ax@dummy.com', 'axP@ssword1', true),
	('dummyuseray', 'ay@dummy.com', 'ayP@ssword1', true),
	('dummyuseraz', 'az@dummy.com', 'azP@ssword1', true),
	('dummyuserba', 'ba@dummy.com', 'baP@ssword1', true),
	('dummyuserbb', 'bb@dummy.com', 'bbP@ssword1', true),
	('dummyuserbc', 'bc@dummy.com', 'bcP@ssword1', true),
	('dummyuserbd', 'bd@dummy.com', 'bdP@ssword1', true),
	('dummyuserbe', 'be@dummy.com', 'beP@ssword1', true),
	('dummyuserbf', 'bf@dummy.com', 'bfP@ssword1', true),
	('dummyuserbg', 'bg@dummy.com', 'bgP@ssword1', true),
	('dummyuserbh', 'bh@dummy.com', 'bhP@ssword1', true),
	('dummyuserbi', 'bi@dummy.com', 'biP@ssword1', true),
	('dummyuserbj', 'bj@dummy.com', 'bjP@ssword1', true),
	('dummyuserbk', 'bk@dummy.com', 'bkP@ssword1', true),
	('dummyuserbl', 'bl@dummy.com', 'blP@ssword1', true),
	('dummyuserbm', 'bm@dummy.com', 'bmP@ssword1', true),
	('dummyuserbn', 'bn@dummy.com', 'bnP@ssword1', true),
	('dummyuserbo', 'bo@dummy.com', 'boP@ssword1', true),
	('dummyuserbp', 'bp@dummy.com', 'bpP@ssword1', true),
	('dummyuserbq', 'bq@dummy.com', 'bqP@ssword1', true),
	('dummyuserbr', 'br@dummy.com', 'brP@ssword1', true),
	('dummyuserbs', 'bs@dummy.com', 'bsP@ssword1', true),
	('dummyuserbt', 'bt@dummy.com', 'btP@ssword1', true),
	('dummyuserbu', 'bu@dummy.com', 'buP@ssword1', true),
	('dummyuserbv', 'bv@dummy.com', 'bvP@ssword1', true),
	('dummyuserbw', 'bw@dummy.com', 'bwP@ssword1', true),
	('dummyuserbx', 'bx@dummy.com', 'bxP@ssword1', true),
	('dummyuserby', 'by@dummy.com', 'byP@ssword1', true),
	('dummyuserbz', 'bz@dummy.com', 'bzP@ssword1', true),
	('dummyuserca', 'ca@dummy.com', 'caP@ssword1', true),
	('dummyusercb', 'cb@dummy.com', 'cbP@ssword1', true),
	('dummyusercc', 'cc@dummy.com', 'ccP@ssword1', true),
	('dummyusercd', 'cd@dummy.com', 'cdP@ssword1', true),
	('dummyuserce', 'ce@dummy.com', 'ceP@ssword1', true),
	('dummyusercf', 'cf@dummy.com', 'cfP@ssword1', true),
	('dummyusercg', 'cg@dummy.com', 'cgP@ssword1', true),
	('dummyuserch', 'ch@dummy.com', 'chP@ssword1', true),
	('dummyuserci', 'ci@dummy.com', 'ciP@ssword1', true),
	('dummyusercj', 'cj@dummy.com', 'cjP@ssword1', true),
	('dummyuserck', 'ck@dummy.com', 'ckP@ssword1', true),
	('dummyusercl', 'cl@dummy.com', 'clP@ssword1', true),
	('dummyusercm', 'cm@dummy.com', 'cmP@ssword1', true),
	('dummyusercn', 'cn@dummy.com', 'cnP@ssword1', true),
	('dummyuserco', 'co@dummy.com', 'coP@ssword1', true),
	('dummyusercp', 'cp@dummy.com', 'cpP@ssword1', true),
	('dummyusercq', 'cq@dummy.com', 'cqP@ssword1', true),
	('dummyusercr', 'cr@dummy.com', 'crP@ssword1', true),
	('dummyusercs', 'cs@dummy.com', 'csP@ssword1', true),
	('dummyuserct', 'ct@dummy.com', 'ctP@ssword1', true),
	('dummyusercu', 'cu@dummy.com', 'cuP@ssword1', true),
	('dummyusercv', 'cv@dummy.com', 'cvP@ssword1', true),
	('dummyusercw', 'cw@dummy.com', 'cwP@ssword1', true),
	('dummyusercx', 'cx@dummy.com', 'cxP@ssword1', true),
	('dummyusercy', 'cy@dummy.com', 'cyP@ssword1', true),
	('dummyusercz', 'cz@dummy.com', 'czP@ssword1', true),
	('dummyuserda', 'da@dummy.com', 'daP@ssword1', true),
	('dummyuserdb', 'db@dummy.com', 'dbP@ssword1', true),
	('dummyuserdc', 'dc@dummy.com', 'dcP@ssword1', true),
	('dummyuserdd', 'dd@dummy.com', 'ddP@ssword1', true),
	('dummyuserde', 'de@dummy.com', 'deP@ssword1', true),
	('dummyuserdf', 'df@dummy.com', 'dfP@ssword1', true),
	('dummyuserdg', 'dg@dummy.com', 'dgP@ssword1', true),
	('dummyuserdh', 'dh@dummy.com', 'dhP@ssword1', true),
	('dummyuserdi', 'di@dummy.com', 'diP@ssword1', true),
	('dummyuserdj', 'dj@dummy.com', 'djP@ssword1', true),
	('dummyuserdk', 'dk@dummy.com', 'dkP@ssword1', true),
	('dummyuserdl', 'dl@dummy.com', 'dlP@ssword1', true),
	('dummyuserdm', 'dm@dummy.com', 'dmP@ssword1', true),
	('dummyuserdn', 'dn@dummy.com', 'dnP@ssword1', true),
	('dummyuserdo', 'do@dummy.com', 'doP@ssword1', true),
	('dummyuserdp', 'dp@dummy.com', 'dpP@ssword1', true),
	('dummyuserdq', 'dq@dummy.com', 'dqP@ssword1', true),
	('dummyuserdr', 'dr@dummy.com', 'drP@ssword1', true),
	('dummyuserds', 'ds@dummy.com', 'dsP@ssword1', true),
	('dummyuserdt', 'dt@dummy.com', 'dtP@ssword1', true),
	('dummyuserdu', 'du@dummy.com', 'duP@ssword1', true),
	('dummyuserdv', 'dv@dummy.com', 'dvP@ssword1', true),
	('dummyuserdw', 'dw@dummy.com', 'dwP@ssword1', true),
	('dummyuserdx', 'dx@dummy.com', 'dxP@ssword1', true),
	('dummyuserdy', 'dy@dummy.com', 'dyP@ssword1', true),
	('dummyuserdz', 'dz@dummy.com', 'dzP@ssword1', true),
	('dummyuserea', 'ea@dummy.com', 'eaP@ssword1', true),
	('dummyusereb', 'eb@dummy.com', 'ebP@ssword1', true),
	('dummyuserec', 'ec@dummy.com', 'ecP@ssword1', true),
	('dummyusered', 'ed@dummy.com', 'edP@ssword1', true),
	('dummyuseree', 'ee@dummy.com', 'eeP@ssword1', true),
	('dummyuseref', 'ef@dummy.com', 'efP@ssword1', true),
	('dummyusereg', 'eg@dummy.com', 'egP@ssword1', true),
	('dummyusereh', 'eh@dummy.com', 'ehP@ssword1', true),
	('dummyuserei', 'ei@dummy.com', 'eiP@ssword1', true),
	('dummyuserej', 'ej@dummy.com', 'ejP@ssword1', true),
	('dummyuserek', 'ek@dummy.com', 'ekP@ssword1', true),
	('dummyuserel', 'el@dummy.com', 'elP@ssword1', true),
	('dummyuserem', 'em@dummy.com', 'emP@ssword1', true),
	('dummyuseren', 'en@dummy.com', 'enP@ssword1', true),
	('dummyusereo', 'eo@dummy.com', 'eoP@ssword1', true),
	('dummyuserep', 'ep@dummy.com', 'epP@ssword1', true),
	('dummyusereq', 'eq@dummy.com', 'eqP@ssword1', true),
	('dummyuserer', 'er@dummy.com', 'erP@ssword1', true),
	('dummyuseres', 'es@dummy.com', 'esP@ssword1', true),
	('dummyuseret', 'et@dummy.com', 'etP@ssword1', true),
	('dummyusereu', 'eu@dummy.com', 'euP@ssword1', true),
	('dummyuserev', 'ev@dummy.com', 'evP@ssword1', true),
	('dummyuserew', 'ew@dummy.com', 'ewP@ssword1', true),
	('dummyuserex', 'ex@dummy.com', 'exP@ssword1', true),
	('dummyuserey', 'ey@dummy.com', 'eyP@ssword1', true),
	('dummyuserez', 'ez@dummy.com', 'ezP@ssword1', true),
	('dummyuserfa', 'fa@dummy.com', 'faP@ssword1', true),
	('dummyuserfb', 'fb@dummy.com', 'fbP@ssword1', true);
	