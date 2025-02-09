

import random
import time

class BasePongGame:
    def __init__(self, game_id):
        self.game_id = game_id
        self.start_delay = 3.0
        self.start_time = time.time()
        self.max_score = 3
        self.game_over = False
        self.state = {
            "ball": {"x": 0, "y": 0, "vx": 0.6, "vy": 0.6},
            "players": {
                1: {"x": -1.5, "y": 0},  # Joueur 1 (gauche) ✅ Correspond à -1.5 en frontend
                2: {"x": 1.5, "y": 0},  # Joueur 2 (droite) ✅ Correspond à 1.5 en frontend
            },
            "scores": {1: 0, 2: 0}
        }
        self.last_update = time.time()
        self.paddle_half_height = 0.3  # Demi-hauteur des paddles


    def move_paddle(self, player_id, direction):
        """Déplace la paddle d'un joueur en fonction de l'entrée utilisateur, sans sortir des limites."""
        if player_id not in self.state["players"]:
            return

        step = 0.1  # Vitesse de déplacement
        old_y = self.state["players"][player_id]["y"] 

        if direction == "up":
            self.state["players"][player_id]["y"] = min(1 - self.paddle_half_height, self.state["players"][player_id]["y"] + step)
        elif direction == "down":
            self.state["players"][player_id]["y"] = max(-1 + self.paddle_half_height, self.state["players"][player_id]["y"] - step)


    def update(self):
        """Met à jour l'état du jeu : déplacement de la balle, gestion des collisions et scoring."""
        if self.game_over:
            return

        now = time.time()
        dt = now - self.last_update
        self.last_update = now

        # Vérifier si le délai de démarrage est écoulé
        elapsed_since_start = now - self.start_time
        if elapsed_since_start < self.start_delay:
            self.state["waitingForStart"] = True
            return
        else:
            self.state["waitingForStart"] = False

        ball = self.state["ball"]
        players = self.state["players"]
        p1, p2 = players[1], players[2]

        # 1) Déplacer la balle selon sa vitesse (vx, vy)
        ball["x"] += ball["vx"] * dt
        ball["y"] += ball["vy"] * dt

        # 2) Vérifier les collisions avec les murs (haut/bas)
        if ball["y"] >= 0.95:  # Mur du haut
            ball["y"] = 0.95
            ball["vy"] *= -1
        elif ball["y"] <= -0.95:  # Mur du bas
            ball["y"] = -0.95
            ball["vy"] *= -1

        # 3) Collision avec la paddle du Joueur 1 (gauche)
# 3) Collision avec la paddle du Joueur 1 (gauche)
        if ball["x"] <= -1.55:
            if p1["y"] - self.paddle_half_height <= ball["y"] <= p1["y"] + self.paddle_half_height:
                impact = (ball["y"] - p1["y"]) / self.paddle_half_height  # Impact normalisé (-1 à 1)
                ball["vx"] = abs(ball["vx"]) * 1.1  # 🚀 Augmente légèrement la vitesse
                ball["vy"] += impact * 0.2  # 🔄 Applique un effet de spin

            else:
                self.state["scores"][2] += 1
                self.reset_ball("right")

        # 4) Collision avec la paddle du Joueur 2 (droite)
        if ball["x"] >= 1.55:
            if p2["y"] - self.paddle_half_height <= ball["y"] <= p2["y"] + self.paddle_half_height:
                impact = (ball["y"] - p2["y"]) / self.paddle_half_height  # Impact normalisé (-1 à 1)
                ball["vx"] = -abs(ball["vx"]) * 1.1  # 🚀 Augmente légèrement la vitesse
                ball["vy"] += impact * 0.2  # 🔄 Applique un effet de spin

            else:
                self.state["scores"][1] += 1
                self.reset_ball("left")

        # 5) Vérifier si la partie est terminée
        if self.state["scores"][1] >= self.max_score or self.state["scores"][2] >= self.max_score:
            self.game_over = True

    def reset_ball(self, direction="right"):
        """Réinitialise la balle au centre après un point marqué."""
        self.state["ball"]["x"] = 0
        self.state["ball"]["y"] = random.uniform(-0.3, 0.3)  # Position aléatoire pour éviter les répétitions

        if direction == "right":
            self.state["ball"]["vx"] = 0.6
        else:
            self.state["ball"]["vx"] = -0.6

        self.state["ball"]["vy"] = random.choice([-0.2, 0.2])  # Variation aléatoire de la direction verticale

    def to_dict(self):
        return {
            "ball": self.state["ball"],
            "players": {str(k): v for k, v in self.state["players"].items()},
            "scores": {str(k): v for k, v in self.state["scores"].items()},
            "game_over": self.game_over
        }
