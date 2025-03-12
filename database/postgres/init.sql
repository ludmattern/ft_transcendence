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
	('dummyusera', 'a@dummy.com', 'apassword', true),
	('dummyuserb', 'b@dummy.com', 'bpassword', true),
	('dummyuserc', 'c@dummy.com', 'cpassword', true),
	('dummyuserd', 'd@dummy.com', 'dpassword', true),
	('dummyusere', 'e@dummy.com', 'epassword', true),
	('dummyuserf', 'f@dummy.com', 'fpassword', true),
	('dummyuserg', 'g@dummy.com', 'gpassword', true),
	('dummyuserh', 'h@dummy.com', 'hpassword', true),
	('dummyuseri', 'i@dummy.com', 'ipassword', true),
	('dummyuserj', 'j@dummy.com', 'jpassword', true),
	('dummyuserk', 'k@dummy.com', 'kpassword', true),
	('dummyuserl', 'l@dummy.com', 'lpassword', true),
	('dummyuserm', 'm@dummy.com', 'mpassword', true),
	('dummyusern', 'n@dummy.com', 'npassword', true),
	('dummyusero', 'o@dummy.com', 'opassword', true),
	('dummyuserp', 'p@dummy.com', 'ppassword', true),
	('dummyuserq', 'q@dummy.com', 'qpassword', true),
	('dummyuserr', 'r@dummy.com', 'rpassword', true),
	('dummyusers', 's@dummy.com', 'spassword', true),
	('dummyusert', 't@dummy.com', 'tpassword', true),
	('dummyuseru', 'u@dummy.com', 'upassword', true),
	('dummyuserv', 'v@dummy.com', 'vpassword', true),
	('dummyuserw', 'w@dummy.com', 'wpassword', true),
	('dummyuserx', 'x@dummy.com', 'xpassword', true),
	('dummyusery', 'y@dummy.com', 'ypassword', true),
	('dummyuserz', 'z@dummy.com', 'zpassword', true),
	('dummyuseraa', 'aa@dummy.com', 'aapassword', true),
	('dummyuserab', 'ab@dummy.com', 'abpassword', true),
	('dummyuserac', 'ac@dummy.com', 'acpassword', true),
	('dummyuserad', 'ad@dummy.com', 'adpassword', true),
	('dummyuserae', 'ae@dummy.com', 'aepassword', true),
	('dummyuseraf', 'af@dummy.com', 'afpassword', true),
	('dummyuserag', 'ag@dummy.com', 'agpassword', true),
	('dummyuserah', 'ah@dummy.com', 'ahpassword', true),
	('dummyuserai', 'ai@dummy.com', 'aipassword', true),
	('dummyuseraj', 'aj@dummy.com', 'ajpassword', true),
	('dummyuserak', 'ak@dummy.com', 'akpassword', true),
	('dummyuseral', 'al@dummy.com', 'alpassword', true),
	('dummyuseram', 'am@dummy.com', 'ampassword', true),
	('dummyuseran', 'an@dummy.com', 'anpassword', true),
	('dummyuserao', 'ao@dummy.com', 'aopassword', true),
	('dummyuserap', 'ap@dummy.com', 'appassword', true),
	('dummyuseraq', 'aq@dummy.com', 'aqpassword', true),
	('dummyuserar', 'ar@dummy.com', 'arpassword', true),
	('dummyuseras', 'as@dummy.com', 'aspassword', true),
	('dummyuserat', 'at@dummy.com', 'atpassword', true),
	('dummyuserau', 'au@dummy.com', 'aupassword', true),
	('dummyuserav', 'av@dummy.com', 'avpassword', true),
	('dummyuseraw', 'aw@dummy.com', 'awpassword', true),
	('dummyuserax', 'ax@dummy.com', 'axpassword', true),
	('dummyuseray', 'ay@dummy.com', 'aypassword', true),
	('dummyuseraz', 'az@dummy.com', 'azpassword', true),
	('dummyuserba', 'ba@dummy.com', 'bapassword', true),
	('dummyuserbb', 'bb@dummy.com', 'bbpassword', true),
	('dummyuserbc', 'bc@dummy.com', 'bcpassword', true),
	('dummyuserbd', 'bd@dummy.com', 'bdpassword', true),
	('dummyuserbe', 'be@dummy.com', 'bepassword', true),
	('dummyuserbf', 'bf@dummy.com', 'bfpassword', true),
	('dummyuserbg', 'bg@dummy.com', 'bgpassword', true),
	('dummyuserbh', 'bh@dummy.com', 'bhpassword', true),
	('dummyuserbi', 'bi@dummy.com', 'bipassword', true),
	('dummyuserbj', 'bj@dummy.com', 'bjpassword', true),
	('dummyuserbk', 'bk@dummy.com', 'bkpassword', true),
	('dummyuserbl', 'bl@dummy.com', 'blpassword', true),
	('dummyuserbm', 'bm@dummy.com', 'bmpassword', true),
	('dummyuserbn', 'bn@dummy.com', 'bnpassword', true),
	('dummyuserbo', 'bo@dummy.com', 'bopassword', true),
	('dummyuserbp', 'bp@dummy.com', 'bppassword', true),
	('dummyuserbq', 'bq@dummy.com', 'bqpassword', true),
	('dummyuserbr', 'br@dummy.com', 'brpassword', true),
	('dummyuserbs', 'bs@dummy.com', 'bspassword', true),
	('dummyuserbt', 'bt@dummy.com', 'btpassword', true),
	('dummyuserbu', 'bu@dummy.com', 'bupassword', true),
	('dummyuserbv', 'bv@dummy.com', 'bvpassword', true),
	('dummyuserbw', 'bw@dummy.com', 'bwpassword', true),
	('dummyuserbx', 'bx@dummy.com', 'bxpassword', true),
	('dummyuserby', 'by@dummy.com', 'bypassword', true),
	('dummyuserbz', 'bz@dummy.com', 'bzpassword', true),
	('dummyuserca', 'ca@dummy.com', 'capassword', true),
	('dummyusercb', 'cb@dummy.com', 'cbpassword', true),
	('dummyusercc', 'cc@dummy.com', 'ccpassword', true),
	('dummyusercd', 'cd@dummy.com', 'cdpassword', true),
	('dummyuserce', 'ce@dummy.com', 'cepassword', true),
	('dummyusercf', 'cf@dummy.com', 'cfpassword', true),
	('dummyusercg', 'cg@dummy.com', 'cgpassword', true),
	('dummyuserch', 'ch@dummy.com', 'chpassword', true),
	('dummyuserci', 'ci@dummy.com', 'cipassword', true),
	('dummyusercj', 'cj@dummy.com', 'cjpassword', true),
	('dummyuserck', 'ck@dummy.com', 'ckpassword', true),
	('dummyusercl', 'cl@dummy.com', 'clpassword', true),
	('dummyusercm', 'cm@dummy.com', 'cmpassword', true),
	('dummyusercn', 'cn@dummy.com', 'cnpassword', true),
	('dummyuserco', 'co@dummy.com', 'copassword', true),
	('dummyusercp', 'cp@dummy.com', 'cppassword', true),
	('dummyusercq', 'cq@dummy.com', 'cqpassword', true),
	('dummyusercr', 'cr@dummy.com', 'crpassword', true),
	('dummyusercs', 'cs@dummy.com', 'cspassword', true),
	('dummyuserct', 'ct@dummy.com', 'ctpassword', true),
	('dummyusercu', 'cu@dummy.com', 'cupassword', true),
	('dummyusercv', 'cv@dummy.com', 'cvpassword', true),
	('dummyusercw', 'cw@dummy.com', 'cwpassword', true),
	('dummyusercx', 'cx@dummy.com', 'cxpassword', true),
	('dummyusercy', 'cy@dummy.com', 'cypassword', true),
	('dummyusercz', 'cz@dummy.com', 'czpassword', true),
	('dummyuserda', 'da@dummy.com', 'dapassword', true),
	('dummyuserdb', 'db@dummy.com', 'dbpassword', true),
	('dummyuserdc', 'dc@dummy.com', 'dcpassword', true),
	('dummyuserdd', 'dd@dummy.com', 'ddpassword', true),
	('dummyuserde', 'de@dummy.com', 'depassword', true),
	('dummyuserdf', 'df@dummy.com', 'dfpassword', true),
	('dummyuserdg', 'dg@dummy.com', 'dgpassword', true),
	('dummyuserdh', 'dh@dummy.com', 'dhpassword', true),
	('dummyuserdi', 'di@dummy.com', 'dipassword', true),
	('dummyuserdj', 'dj@dummy.com', 'djpassword', true),
	('dummyuserdk', 'dk@dummy.com', 'dkpassword', true),
	('dummyuserdl', 'dl@dummy.com', 'dlpassword', true),
	('dummyuserdm', 'dm@dummy.com', 'dmpassword', true),
	('dummyuserdn', 'dn@dummy.com', 'dnpassword', true),
	('dummyuserdo', 'do@dummy.com', 'dopassword', true),
	('dummyuserdp', 'dp@dummy.com', 'dppassword', true),
	('dummyuserdq', 'dq@dummy.com', 'dqpassword', true),
	('dummyuserdr', 'dr@dummy.com', 'drpassword', true),
	('dummyuserds', 'ds@dummy.com', 'dspassword', true),
	('dummyuserdt', 'dt@dummy.com', 'dtpassword', true),
	('dummyuserdu', 'du@dummy.com', 'dupassword', true),
	('dummyuserdv', 'dv@dummy.com', 'dvpassword', true),
	('dummyuserdw', 'dw@dummy.com', 'dwpassword', true),
	('dummyuserdx', 'dx@dummy.com', 'dxpassword', true),
	('dummyuserdy', 'dy@dummy.com', 'dypassword', true),
	('dummyuserdz', 'dz@dummy.com', 'dzpassword', true),
	('dummyuserea', 'ea@dummy.com', 'eapassword', true),
	('dummyusereb', 'eb@dummy.com', 'ebpassword', true),
	('dummyuserec', 'ec@dummy.com', 'ecpassword', true),
	('dummyusered', 'ed@dummy.com', 'edpassword', true),
	('dummyuseree', 'ee@dummy.com', 'eepassword', true),
	('dummyuseref', 'ef@dummy.com', 'efpassword', true),
	('dummyusereg', 'eg@dummy.com', 'egpassword', true),
	('dummyusereh', 'eh@dummy.com', 'ehpassword', true),
	('dummyuserei', 'ei@dummy.com', 'eipassword', true),
	('dummyuserej', 'ej@dummy.com', 'ejpassword', true),
	('dummyuserek', 'ek@dummy.com', 'ekpassword', true),
	('dummyuserel', 'el@dummy.com', 'elpassword', true),
	('dummyuserem', 'em@dummy.com', 'empassword', true),
	('dummyuseren', 'en@dummy.com', 'enpassword', true),
	('dummyusereo', 'eo@dummy.com', 'eopassword', true),
	('dummyuserep', 'ep@dummy.com', 'eppassword', true),
	('dummyusereq', 'eq@dummy.com', 'eqpassword', true),
	('dummyuserer', 'er@dummy.com', 'erpassword', true),
	('dummyuseres', 'es@dummy.com', 'espassword', true),
	('dummyuseret', 'et@dummy.com', 'etpassword', true),
	('dummyusereu', 'eu@dummy.com', 'eupassword', true),
	('dummyuserev', 'ev@dummy.com', 'evpassword', true),
	('dummyuserew', 'ew@dummy.com', 'ewpassword', true),
	('dummyuserex', 'ex@dummy.com', 'expassword', true),
	('dummyuserey', 'ey@dummy.com', 'eypassword', true),
	('dummyuserez', 'ez@dummy.com', 'ezpassword', true),
	('dummyuserfa', 'fa@dummy.com', 'fapassword', true),
	('dummyuserfb', 'fb@dummy.com', 'fbpassword', true);