import gymnasium as gym
from gymnasium import spaces
import numpy as np
import time

# On importe BasePongGame depuis le même dossier
from games import BasePongGame

class Pong3DEnv(gym.Env):
    """
    Environnement Gym pour ton Pong 3D.
    L'agent contrôle le paddle 1 (à gauche).
    Paddle 2 est un script simpliste (suit la balle).
    """
    def __init__(self, frame_skip=60, max_steps=2000):
        super(Pong3DEnv, self).__init__()
        
        self.frame_skip = frame_skip
        self.max_steps = max_steps
        self.current_steps = 0
        
        # Définition de l'espace d'action
        # 0: stay, 1: up, 2: down, 3: left, 4: right
        self.action_space = spaces.Discrete(5)
        
        # Définition de l'espace d'observation
        # ex: [x, y, z, vx, vy, vz, p1_y, p1_z, p2_y, p2_z]
        low_obs = np.array([
            -5.0, -1.5, -1.5,  # x, y, z min
            -4.0, -4.0, -4.0,  # vx, vy, vz min
            -1.5, -0.75,       # p1 y, z min
            -1.5, -0.75        # p2 y, z min
        ], dtype=np.float32)
        high_obs = np.array([
            5.0, 1.5, 1.5,   # x, y, z max
            4.0, 4.0, 4.0,   # vx, vy, vz max
            1.5, 0.75,       # p1 y, z max
            1.5, 0.75        # p2 y, z max
        ], dtype=np.float32)
        
        self.observation_space = spaces.Box(low=low_obs, high=high_obs, dtype=np.float32)
        
        # On crée notre jeu
        self.game = None

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)

        self.current_steps = 0
        # Crée une nouvelle partie
        self.game = BasePongGame(game_id="train")

        # Observation initiale
        return self._get_obs(), {}

    def step(self, action):
        """
        On exécute l'action de l'agent,
        puis on met à jour le jeu frame_skip fois.
        """
        self.current_steps += 1
        
        # Répéter la même action plusieurs fois (pour simuler 1 act/sec)
        for _ in range(self.frame_skip):
            # Appliquer action agent (paddle 1)
            if action == 1:
                self.game.move_paddle(1, "up")
            elif action == 2:
                self.game.move_paddle(1, "down")
            elif action == 3:
                self.game.move_paddle(1, "left")
            elif action == 4:
                self.game.move_paddle(1, "right")
            # 0 => stay
            
            # Adversaire (paddle 2) suit la balle
            self._opponent_script()
            
            # Update de la physique
            self.game.update()
            
            # Si game_over apparaît, on sort de la boucle
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

        # Ici, on peut détecter si le score vient de changer. 
        # Façon simple : si p1_score > 0 => reward +1, p2_score > 0 => -1.
        # Mais attention : c'est cumulatif. Ajuste si besoin d'un delta.
        if p1_score > 0:
            reward += 1.0
        if p2_score > 0:
            reward -= 1.0

        return reward
