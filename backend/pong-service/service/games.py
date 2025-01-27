# service/games.py
import time

class BasePongGame:
    def __init__(self, game_id):
        self.game_id = game_id
        self.max_score = 3
        self.game_over = False
        self.state = {
            "ball": {"x": 0, "y": 0, "vx": 0.30, "vy": 0.30},
            "players": {
                1: {"x": -0.8, "y": 0},  # Joueur 1
                2: {"x": 0.8,  "y": 0},  # Joueur 2
            },
            "scores": {1: 0, 2: 0}
        }
        self.last_update = time.time()

    def move_paddle(self, player_id, direction):
        if player_id not in self.state["players"]:
            return
        if direction == "up":
            self.state["players"][player_id]["y"] += 0.1
        elif direction == "down":
            self.state["players"][player_id]["y"] -= 0.1

    def update(self):
        if self.game_over:
            return
        now = time.time()
        dt = now - self.last_update
        self.last_update = now

        ball = self.state["ball"]
        players = self.state["players"]
        p1 = players[1]  # Joueur 1
        p2 = players[2]  # Joueur 2

        # 1) Déplacer la balle selon sa vitesse (vx, vy)
        ball["x"] += ball["vx"] * dt
        ball["y"] += ball["vy"] * dt

        # 2) Collision haut/bas
        # Si la balle dépasse y = ±1, on inverse vy.
        if ball["y"] > 1:
            ball["y"] = 1
            ball["vy"] *= -1
        elif ball["y"] < -1:
            ball["y"] = -1
            ball["vy"] *= -1

        # 3) Collision avec la paddle du joueur 1 (à x ~ -0.8)
        # On définit un seuil pour détecter le contact balle/paddle
        # Ex: si la balle est à x < -0.7, c'est qu'elle touche la zone du paddle
        # (Ajuste ce seuil selon la taille de la balle ou la tolérance voulue.)
        paddle_half_height = 0.3  # demi-hauteur de la paddle (0.6 / 2)
        if ball["x"] <= -0.75:  # zone approximative de la paddle 1
            # Vérifie si la balle est alignée verticalement avec la paddle
            if (ball["y"] >= p1["y"] - paddle_half_height and 
                ball["y"] <= p1["y"] + paddle_half_height):
                # Collision => inverser la vitesse en x
                ball["vx"] = abs(ball["vx"])  # renvoie la balle vers la droite
            # Sinon, la balle peut continuer sa course et potentiellement sortir du terrain

        # 4) Collision avec la paddle du joueur 2 (à x ~ 0.8)
        if ball["x"] >= 0.75:  # zone approximative de la paddle 2
            if (ball["y"] >= p2["y"] - paddle_half_height and 
                ball["y"] <= p2["y"] + paddle_half_height):
                # Collision => inverser la vitesse en x
                ball["vx"] = -abs(ball["vx"])  # renvoie la balle vers la gauche

        # 5) Gérer le scoring
        # Si la balle sort trop à gauche => but pour joueur 2
        if ball["x"] < -1.2:
            self.state["scores"][2] += 1
            self.reset_ball(direction="right")  # coup d'envoi vers la droite

        # Si la balle sort trop à droite => but pour joueur 1
        if ball["x"] > 1.2:
            self.state["scores"][1] += 1
            self.reset_ball(direction="left")
            
        if self.state["scores"][1] >= self.max_score or self.state["scores"][2] >= self.max_score:
            self.game_over = True  # Marquer la fin de la partie

    def reset_ball(self, direction="right"):
        self.state["ball"]["x"] = 0
        self.state["ball"]["y"] = 0

        if direction == "right":
            self.state["ball"]["vx"] = 0.30
        else:
            self.state["ball"]["vx"] = -0.30

        # On peut donner une petite vitesse en y aléatoire si on veut
        self.state["ball"]["vy"] = 0.01

    def to_dict(self):
        # Retourne l'état du jeu sous forme de dictionnaire
        return self.state
