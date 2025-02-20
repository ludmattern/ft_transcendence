import gymnasium as gym
from gymnasium import spaces
import numpy as np
import time

# On importe BasePongGame depuis le même dossier
from games import BasePongGame

class Pong3DEnv(gym.Env):
    def __init__(self, frame_skip=60, max_steps=2000):
        super(Pong3DEnv, self).__init__()
        
        self.frame_skip = frame_skip
        self.max_steps = max_steps
        self.current_steps = 0
        
        self.action_space = spaces.Discrete(5)
        
        low_obs = np.array([
            -5.0, -1.5, -1.5,
            -4.0, -4.0, -4.0,  
            -1.5, -0.75,    
            -1.5, -0.75      
        ], dtype=np.float32)
        high_obs = np.array([
            5.0, 1.5, 1.5, 
            4.0, 4.0, 4.0, 
            1.5, 0.75,       
            1.5, 0.75      
        ], dtype=np.float32)
        
        self.observation_space = spaces.Box(low=low_obs, high=high_obs, dtype=np.float32)
        
        self.game = None

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)

        self.current_steps = 0
        self.game = BasePongGame(game_id="train")

        return self._get_obs(), {}

    def step(self, action):

        self.current_steps += 1
        
        for _ in range(self.frame_skip):
            if action == 1:
                self.game.move_paddle(1, "up")
            elif action == 2:
                self.game.move_paddle(1, "down")
            elif action == 3:
                self.game.move_paddle(1, "left")
            elif action == 4:
                self.game.move_paddle(1, "right")
            
            self._opponent_script()
            
            self.game.update()
            
            if self.game.game_over:
                break
        
        obs = self._get_obs()
        reward = self._compute_reward()
        done = self.game.game_over or (self.current_steps >= self.max_steps)
        
        info = {}
        return obs, reward, done, False, info

    def render(self):
        """
        Optionnel : affichage Pygame ou console
        """
        pass

    def _opponent_script(self):
        """
        Contrôle simple du paddle 2 (suit balle en y et z).
        """
        ball = self.game.state["ball"]
        p2 = self.game.state["players"][2]
        
        if ball["y"] > p2["y"]:
            self.game.move_paddle(2, "up")
        else:
            self.game.move_paddle(2, "down")

        if ball["z"] > p2["z"]:
            self.game.move_paddle(2, "right")
        else:
            self.game.move_paddle(2, "left")

    def _get_obs(self):
        """
        Construire le vecteur d'observation (x, y, z, vx, vy, vz, p1_y, p1_z, p2_y, p2_z).
        """
        ball = self.game.state["ball"]
        p1 = self.game.state["players"][1]
        p2 = self.game.state["players"][2]
        
        return np.array([
            ball["x"], ball["y"], ball["z"],
            ball["vx"], ball["vy"], ball["vz"],
            p1["y"], p1["z"],
            p2["y"], p2["z"]
        ], dtype=np.float32)

    def _compute_reward(self):
        """
        Calculer la récompense pour l'agent :
          +1 si on marque,
          -1 si on encaisse,
          +0.1 si on tape la balle.
        """
        reward = 0.0
        
        if self.game.ball_hit_paddle:
            reward += 0.4
        
        p1_score = self.game.user_scores[self.game.player1_id]
        p2_score = self.game.user_scores[self.game.player2_id]

       
        if p1_score > 0:
            reward += 1.0
        if p2_score > 0:
            reward -= 1.0

        return reward
