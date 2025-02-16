import random
import time

class BasePongGame:
    def __init__(self, game_id, player1_id=None, player2_id=None):
        self.game_id = game_id
        self.start_delay = 3.0
        self.start_time = time.time()
        self.max_score = 10
        self.game_over = False

        self.player1_id = player1_id if player1_id else "unknown1"
        self.player2_id = player2_id if player2_id else "unknown2"

        self.player_mapping = {
            self.player1_id: 1,
            self.player2_id: 2
        }

        self.user_scores = {
            self.player1_id: 0,
            self.player2_id: 0
        }

        self.tunnel_width = 5
        self.tunnel_height = 1.5
        self.tunnel_depth = 1.5

        self.paddle_width = 0.07
        self.paddle_height = 0.33
        self.paddle_depth = 0.33
        self.ball_reset_time =1
        self.state = {
            "ball": {
                "x": 0, "y": 0, "z": 0,
                "vx": 2, "vy": random.uniform(-1.5, 1.5), "vz": random.uniform(-1.5, 1.5)
            },
            "players": {
                1: {"x": -self.tunnel_width / 2.2, "y": 0, "z": 0},
                2: {"x": self.tunnel_width / 2.2, "y": 0, "z": 0},
            },
            "scores": {1: 0, 2: 0}
        }

        self.vmax = 5
        self.last_update = time.time()


    def move_paddle(self, player_id, direction):
        """Déplace la paddle et empêche de sortir du tunnel."""
        if player_id not in self.state["players"]:
            return

        step = 0.05
        player = self.state["players"][player_id]

        if direction == "up":
            player["y"] = min(self.tunnel_height / 2 - self.paddle_height / 2, player["y"] + step)
        elif direction == "down":
            player["y"] = max(-self.tunnel_height / 2 + self.paddle_height / 2, player["y"] - step)
        elif direction == "left":
            player["z"] = max(-self.tunnel_depth / 2 + self.paddle_depth / 2, player["z"] - step)  
        elif direction == "right":
            player["z"] = min(self.tunnel_depth / 2 - self.paddle_depth / 2, player["z"] + step)  



    def update(self):
        """Met à jour l'état du jeu : déplacement de la balle, gestion des collisions et scoring."""
        if self.game_over:
            return

        now = time.time()
        dt = now - self.last_update
        self.last_update = now

        elapsed_since_start = now - self.start_time
        if elapsed_since_start < self.start_delay:
            self.state["waitingForStart"] = True
            return
        else:
            self.state["waitingForStart"] = False

        if self.state.get("ball_waiting", False):
            if now - self.ball_reset_time < 1:
                if self.state.get("ball_following_paddle", False):
                    paddle = self.state["players"][self.scoring_player]
                    lerp_factor = 0.1

                    offset_x = 0.5 if self.scoring_player == 1 else -0.5

                    self.state["ball"]["x"] += (paddle["x"] + offset_x - self.state["ball"]["x"]) * lerp_factor
                    self.state["ball"]["y"] += (paddle["y"] - self.state["ball"]["y"]) * lerp_factor
                    self.state["ball"]["z"] += (paddle["z"] - self.state["ball"]["z"]) * lerp_factor
                return  
            else:
                paddle = self.state["players"][self.scoring_player]

                offset_x = 0.5 if self.scoring_player == 1 else -0.5

                self.state["ball"]["x"] = paddle["x"] + offset_x
                self.state["ball"]["y"] = paddle["y"]
                self.state["ball"]["z"] = paddle["z"]

                self.state["ball_waiting"] = False
                self.state["ball_following_paddle"] = False

                speed_factor = 1.1

                direction = 1 if self.scoring_player == 1 else -1  
                self.state["ball"]["vx"] = 2 * speed_factor * direction

        players = self.state["players"]
        p1, p2 = players[1], players[2]
        ball = self.state["ball"]

        ball["x"] += ball["vx"] * dt
        ball["y"] += ball["vy"] * dt
        ball["z"] += ball["vz"] * dt  
        speed = (ball["vx"] ** 2 + ball["vy"] ** 2 + ball["vz"] ** 2) ** 0.5  
        if speed > self.vmax:
            factor = self.vmax / speed
            ball["vx"] *= factor
            ball["vy"] *= factor
            ball["vz"] *= factor
        elif speed < 2.0:
            factor = 2.0 / speed
            ball["vx"] *= factor
            
        if abs(ball["vx"]) < 2:
            ball["vx"] = 2 if ball["vx"] >= 0 else -2
        speed = (ball["vx"] ** 2 + ball["vy"] ** 2 + ball["vz"] ** 2) ** 0.5  

        if speed > self.vmax:
            factor = self.vmax / speed
            ball["vx"] *= factor
            ball["vy"] *= factor
            ball["vz"] *= factor
            
        
        if ball["y"] >= self.tunnel_height / 2 - self.paddle_height / 2:
            ball["y"] = self.tunnel_height / 2 - self.paddle_height / 2
            ball["vy"] *= -1 
        elif ball["y"] <= -self.tunnel_height / 2 + self.paddle_height / 2:
            ball["y"] = -self.tunnel_height / 2 + self.paddle_height / 2
            ball["vy"] *= -1  

        if ball["z"] >= self.tunnel_depth / 2 - self.paddle_depth / 2:
            ball["z"] = self.tunnel_depth / 2 - self.paddle_depth / 2
            ball["vz"] *= -1 
        elif ball["z"] <= -self.tunnel_depth / 2 + self.paddle_depth / 2:
            ball["z"] = -self.tunnel_depth / 2 + self.paddle_depth / 2
            ball["vz"] *= -1

        margin_before_scoring = 0.3

        if ball["x"] <= p1["x"] + self.paddle_width:
            if (p1["y"] - self.paddle_height / 2 <= ball["y"] <= p1["y"] + self.paddle_height / 2) and \
            (p1["z"] - self.paddle_depth / 2 <= ball["z"] <= p1["z"] + self.paddle_depth / 2):

                impact_y = (ball["y"] - p1["y"]) / (self.paddle_height / 2)
                impact_z = (ball["z"] - p1["z"]) / (self.paddle_depth / 2)

                ball["vx"] = abs(ball["vx"]) * 1.07
                ball["vy"] += impact_y * 0.8
                ball["vz"] += impact_z *0.8
            elif ball["x"] <= p1["x"] - margin_before_scoring:  
                scoring_player_id = self.player2_id 
                self.user_scores[scoring_player_id] += 1
                self.state["scores"][self.player_mapping[scoring_player_id]] += 1
                self.reset_ball("right")

        if ball["x"] >= p2["x"] - self.paddle_width:
            if (p2["y"] - self.paddle_height / 2 <= ball["y"] <= p2["y"] + self.paddle_height / 2) and \
            (p2["z"] - self.paddle_depth / 2 <= ball["z"] <= p2["z"] + self.paddle_depth / 2):

                impact_y = (ball["y"] - p2["y"]) / (self.paddle_height / 2)
                impact_z = (ball["z"] - p2["z"]) / (self.paddle_depth / 2)

                ball["vx"] = -abs(ball["vx"]) * 1.07
                ball["vy"] += impact_y * 0.8
                ball["vz"] += impact_z * 0.8
            elif ball["x"] >= p2["x"] + margin_before_scoring: 
                scoring_player_id = self.player1_id
                self.user_scores[scoring_player_id] += 1
                self.state["scores"][self.player_mapping[scoring_player_id]] += 1
                self.reset_ball("left")

        if self.user_scores[self.player1_id] >= self.max_score or self.user_scores[self.player2_id] >= self.max_score:
            self.game_over = True





    def reset_ball(self, direction="right"):

        if direction == "right":
            self.scoring_player = 1
        else:
            self.scoring_player = 2

        self.state["ball_waiting"] = True
        self.state["ball_following_paddle"] = True
        self.ball_reset_time = time.time()  

        self.state["ball"]["vx"] = 0
        self.state["ball"]["vy"] = 0
        self.state["ball"]["vz"] = 0


    def to_dict(self):
        return {
            "ball": self.state["ball"],
            "players": {str(k): v for k, v in self.state["players"].items()},
            "scores": {str(k): v for k, v in self.state["scores"].items()},
            "user_scores": self.user_scores,
            "game_over": self.game_over
        }