from games import BasePongGame
from env_pong3d import Pong3DEnv


import os
from stable_baselines3 import PPO

MODEL_PATH = os.path.join(os.path.dirname(__file__), "pong3d_agent.zip")

def load_model():
    return PPO.load(MODEL_PATH) if os.path.exists(MODEL_PATH) else None