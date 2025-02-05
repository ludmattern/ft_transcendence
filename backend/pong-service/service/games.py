# service/games.py
import time

class BasePongGame:
    def __init__(self, game_id):
        self.game_id = game_id
        self.start_delay = 3 
        self.start_time = time.time()
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
            return  # Ne rien faire si la partie est terminée

        now = time.time()
        dt = now - self.last_update
        self.last_update = now

        # Vérifier si le délai de démarrage est terminé
        elapsed_since_start = now - self.start_time
        if elapsed_since_start < self.start_delay:
            self.state["waitingForStart"] = True
            return  # Ne pas bouger la balle tant que le délai n'est pas écoulé
        else:
            self.state["waitingForStart"] = False

        ball = self.state["ball"]  # Référence à l'objet "balle"
        players = self.state["players"]
        p1 = players[1]  # Joueur 1
        p2 = players[2]  # Joueur 2

        # 1) Déplacer la balle selon sa vitesse (vx, vy)
        ball["x"] += ball["vx"] * dt
        ball["y"] += ball["vy"] * dt

        # 2) Collision haut/bas
        if ball["y"] > 1:
            ball["y"] = 1
            ball["vy"] *= -1
        elif ball["y"] < -1:
            ball["y"] = -1
            ball["vy"] *= -1

        # 3) Collision avec la paddle du joueur 1 (à x ~ -0.8)
        paddle_half_height = 0.3  # demi-hauteur de la paddle (0.6 / 2)
        if ball["x"] <= -0.75:  # zone approximative de la paddle 1
            if (ball["y"] >= p1["y"] - paddle_half_height and 
                ball["y"] <= p1["y"] + paddle_half_height):
                ball["vx"] = abs(ball["vx"])  # renvoie la balle vers la droite

        # 4) Collision avec la paddle du joueur 2 (à x ~ 0.8)
        if ball["x"] >= 0.75:  # zone approximative de la paddle 2
            if (ball["y"] >= p2["y"] - paddle_half_height and 
                ball["y"] <= p2["y"] + paddle_half_height):
                ball["vx"] = -abs(ball["vx"])  # renvoie la balle vers la gauche

        # 5) Gérer le scoring
        if ball["x"] < -1.2:  # Balle sort trop à gauche
            self.state["scores"][2] += 1
            self.reset_ball(direction="right")
        elif ball["x"] > 1.2:  # Balle sort trop à droite
            self.state["scores"][1] += 1
            self.reset_ball(direction="left")

        # Vérifier si la partie est terminée
        if self.state["scores"][1] >= self.max_score or self.state["scores"][2] >= self.max_score:
            self.game_over = True

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
        return {
            "ball": self.state["ball"],
            "players": {str(k): v for k, v in self.state["players"].items()},  # 🔄 Convertir les clés en str
            "scores": {str(k): v for k, v in self.state["scores"].items()},  # 🔄 Convertir les clés en str
            "game_over": self.game_over
        }


