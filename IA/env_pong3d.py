import gymnasium as gym
from gymnasium import spaces
import numpy as np
import time
from games import BasePongGame 

def ai_decision(game, ai_player_id):
    """Simple AI qui anticipe la balle et ajuste sa position"""
    player_num = game.player_mapping[ai_player_id]
    paddle = game.state["players"][player_num]
    ball = game.state["ball"]

    ball_coming_toward_ai = (player_num == 2 and ball["vx"] > 0) or (player_num == 1 and ball["vx"] < 0)

    if not ball_coming_toward_ai:
        return 0.0, 0.0

    dx = (paddle["x"] - ball["x"])  
    vx = ball["vx"]
    if abs(vx) < 1e-6:
        return paddle["y"], paddle["z"] 

    time_to_reach = dx / vx
    if time_to_reach < 0:
        return paddle["y"], paddle["z"] 

    target_y = ball["y"] + ball["vy"] * time_to_reach
    target_z = ball["z"] + ball["vz"] * time_to_reach

    target_y = np.clip(target_y, -game.tunnel_height / 2 + game.paddle_height / 2,
                                 game.tunnel_height / 2 - game.paddle_height / 2)
    target_z = np.clip(target_z, -game.tunnel_depth / 2 + game.paddle_depth / 2,
                                 game.tunnel_depth / 2 - game.paddle_depth / 2)

    return target_y, target_z

class Pong3DEnv(gym.Env):
    def __init__(self, frame_skip=60, max_steps=2000):
        super(Pong3DEnv, self).__init__()
        self.frame_skip = frame_skip
        self.max_steps = max_steps
        self.current_steps = 0
        
        self.action_space = spaces.Box(low=np.array([-1.5, -0.75]), 
                                       high=np.array([1.5, 0.75]), 
                                       dtype=np.float32)
        
        self.observation_space = spaces.Box(low=np.array([-5.0, -1.5, -1.5, -4.0, -4.0, -4.0, -1.5, -0.75, -1.5, -0.75]),
                                            high=np.array([5.0, 1.5, 1.5, 4.0, 4.0, 4.0, 1.5, 0.75, 1.5, 0.75]),
                                            dtype=np.float32)
        
        self.game = None

    def reset(self, seed=None, options=None):
        
        self.game = BasePongGame(game_id="ai_vs_script", player1_id="Script", player2_id="AI")
        self.current_steps = 0
        return self._get_obs(), {}

    def step(self, action):
        self.current_steps += 1
        if self.current_steps > self.max_steps:
            return self._get_obs(), 0, True, False, {}

        target_y, target_z = action

        self.game.move_paddle(2, "up" if target_y > self.game.state["players"][1]["y"] else "down")
        self.game.move_paddle(2, "right" if target_z > self.game.state["players"][1]["z"] else "left")

        self._opponent_script() 
        self.game.update() 

        reward = self._compute_reward()
        done = self.game.game_over

        return self._get_obs(), reward, done, False, {}

    def _opponent_script(self):
        """Script de l'adversaire (réagit à la balle)"""
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
        """Définit la fonction de récompense"""
        if self.game.ball_hit_paddle:
            return 1.0 
        if self.game.ball_hit_wall:
            return -0.1  
        if self.game.user_scores["AI"] > self.game.user_scores["Script"]:
            return 5.0 
        return -0.5  