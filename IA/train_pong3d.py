import os
from stable_baselines3 import PPO  # type: ignore
from stable_baselines3.common.vec_env import DummyVecEnv  # type: ignore

from env_pong3d import Pong3DEnv

SAVE_PATH = "./models/pong3d_agent"


def main():
    env = Pong3DEnv(frame_skip=60, max_steps=2000)
    env = DummyVecEnv([lambda: env])  # Vectorized env

    if os.path.exists(SAVE_PATH + ".zip"):
        print("🔄 Chargement du modèle existant...")
        model = PPO.load(SAVE_PATH, env)
    else:
        print("🚀 Création d'un nouveau modèle...")
        model = PPO("MlpPolicy", env, verbose=1)

    TIMESTEPS = 100000
    for i in range(1, 21):
        model.learn(total_timesteps=TIMESTEPS, reset_num_timesteps=False)
        model.save(SAVE_PATH)
        print(f"📂 Modèle sauvegardé après {i * TIMESTEPS} steps")

    print("✅ Entraînement terminé, modèle final sauvegardé.")


if __name__ == "__main__":
    main()
