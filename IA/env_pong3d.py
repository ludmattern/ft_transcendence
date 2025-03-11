import gymnasium as gym
from gymnasium import spaces
import numpy as np
import time
from games import BasePongGame 
import os

import os
from datetime import datetime
import random

LOG_FILE = "custom_log.txt"

def custom_log(message: str):
    """
    Écrit un message dans un fichier LOG_FILE en mode append.
    Ajoute un timestamp pour le suivi.
    """
    # Crée le dossier de logs si besoin
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True) if os.path.dirname(LOG_FILE) else None

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"{message}\n")


def ai_decision(game, ai_player_id):
    player_num = game.player_mapping[ai_player_id]
    paddle = game.state["players"][player_num]
    ball = game.state["ball"]

    ball_coming_toward_ai = False
    if player_num == 2 and ball["vx"] > 0:
        ball_coming_toward_ai = True
    elif player_num == 1 and ball["vx"] < 0:
        ball_coming_toward_ai = True

    if not ball_coming_toward_ai:
        target_y = 0.0
        target_z = 0.0
    else:
        dx = (paddle["x"] - ball["x"])  
        vx = ball["vx"]
        if abs(vx) < 1e-6:
            return paddle["y"], paddle["z"] 

        time_to_reach = dx / vx
        if time_to_reach < 0:
            return paddle["y"], paddle["z"] 

        predicted_y = ball["y"] + ball["vy"] * time_to_reach
        predicted_z = ball["z"] + ball["vz"] * time_to_reach

        target_y = max(-game.tunnel_height / 2 + game.paddle_height / 2,
                       min(game.tunnel_height / 2 - game.paddle_height / 2, predicted_y))
        target_z = max(-game.tunnel_depth / 2 + game.paddle_depth / 2,
                       min(game.tunnel_depth / 2 - game.paddle_depth / 2, predicted_z))

    return target_y, target_z


class Pong3DEnv(gym.Env):
    def __init__(self, frame_skip=1, max_steps=2000):
        super(Pong3DEnv, self).__init__()
        self.frame_skip = frame_skip
        self.max_steps = max_steps
        self.current_steps = 0
        self.tick_counter = 0 
        self.target_y = 0.0 
        self.target_z = 0.0
        self.action_space = spaces.Box(low=np.array([-1.5, -0.75]), 
                                       high=np.array([1.5, 0.75]), 
                                       dtype=np.float32)

        self.observation_space = spaces.Box(
            low=np.array([-5.0, -1.5, -1.5, -4.0, -4.0, -4.0, -1.5, -0.75, -1.5, -0.75]),
            high=np.array([5.0, 1.5, 1.5, 4.0, 4.0, 4.0, 1.5, 0.75, 1.5, 0.75]),
            dtype=np.float32
        )
        self.last_obs = None  
        self.frames_per_decision = 15
        self.game = None
        self.out_of_bounds_penalty = 0.0

    def reset(self, seed=None, options=None):
        """Réinitialise le jeu"""
        self.game = BasePongGame(game_id="ai_vs_script", player1_id="Script", player2_id="AI")
        self.current_steps = 0
        self.tick_counter = 0 
        self.last_obs = self._get_obs().astype(np.float32)  
        return self.last_obs, {}

    def step(self, action):
        self.current_steps += 1
        self.tick_counter += 1 
        
        if self.current_steps > self.max_steps:
            custom_log(f"🎮 Step {self.current_steps}/{self.max_steps} RESTART - Maximum steps reached")
            return self._get_obs(), 0, True, False, {}

        if self.tick_counter % self.frames_per_decision == 0:
            self.target_y, self.target_z = action  
            self.last_obs = self._get_obs().astype(np.float32) 

        ai_player = self.game.state["players"][2]
        
        if self.target_y > ai_player["y"]:
            self.game.move_paddle(2, "up")
        elif self.target_y < ai_player["y"]:
            self.game.move_paddle(2, "down")

        if self.target_z > ai_player["z"]:
            self.game.move_paddle(2, "right")
        elif self.target_z < ai_player["z"]:
            self.game.move_paddle(2, "left")


        max_y, min_y = 0.585, -0.585
        max_z, min_z = 0.585, -0.585

        out_of_bounds_penalty = 0.0
        if self.target_y > max_y or self.target_y < min_y:
            out_of_bounds_penalty -= 1.0
        if self.target_z > max_z or self.target_z < min_z:
            out_of_bounds_penalty -= 1.0
        self.out_of_bounds_penalty = out_of_bounds_penalty

        self._opponent_script()  
        self.game.update()  
        
        reward = self._compute_reward()
        
        done = self.game.game_over
        if done:
            custom_log(f"🎮 Step {self.current_steps}/{self.max_steps} - Reward: {reward:.2f} RESATRTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT")

        return self.last_obs, reward, done, False, {}


    def _opponent_script(self):
        if self.tick_counter % 20 == 0: 
            target_y, target_z = ai_decision(self.game, "Script")
            
            
            self.game.move_paddle(1, "up" if target_y > self.game.state["players"][1]["y"] else "down")
            self.game.move_paddle(1, "right" if target_z > self.game.state["players"][1]["z"] else "left")
    def _get_obs(self):
        """Renvoie l'état du jeu sous forme de vecteur"""
        ball = self.game.state["ball"]
        p1 = self.game.state["players"][1]
        p2 = self.game.state["players"][2]
        return np.array([ball["x"], ball["y"], ball["z"], ball["vx"], ball["vy"], ball["vz"], p1["y"], p1["z"], p2["y"], p2["z"]], dtype=np.float32)

    def _compute_reward(self):
        reward = 0.0
        if self.out_of_bounds_penalty < 0:
            reward += self.out_of_bounds_penalty
        if self.game.ball_hit_paddle_p1:
            reward += 2.0  
            custom_log("🏓 Reward +1.0: Ball hit paddle")

        if self.game.last_score_update == "AI":  
           #reward += 3.0 
            custom_log("🥇 Reward +3.0: AI scored a point {self.game.last_score_update}")

        elif self.game.last_score_update == "Script":
            reward -= 10.0  
            custom_log("😢 Penalty -3.0: AI lost a point {self.game.last_score_update}")
       
        self.out_of_bounds_penalty = 0.0
        self.game.last_score_update = None  
        return reward
