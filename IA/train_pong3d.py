import os
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import SubprocVecEnv  # Utilisation de SubprocVecEnv pour le multithreading
from env_pong3d import Pong3DEnv

SAVE_PATH = "./models/pong3d_agent"
N_ENVS = 4  # Lance 4 environnements en parallèle (ajuste selon ton CPU)

def make_env():
    return Pong3DEnv(frame_skip=15, max_steps=2000)  # Réduit frame_skip pour plus de mises à jour

def main():
    env = SubprocVecEnv([lambda: make_env() for _ in range(N_ENVS)])  # Multi-process

    if os.path.exists(SAVE_PATH + ".zip"):
        print("🔄 Chargement du modèle existant...")
        model = PPO.load(SAVE_PATH, env)
    else:
        print("🚀 Création d'un nouveau modèle...")
        model = PPO("MlpPolicy", env, verbose=1, n_steps=2048, batch_size=64, ent_coef=0.01)

    TIMESTEPS = 500000
    for i in range(1, 21):
        model.learn(total_timesteps=TIMESTEPS, reset_num_timesteps=False)
        model.save(SAVE_PATH)
        print(f"📂 Modèle sauvegardé après {i * TIMESTEPS} steps")

    print("✅ Entraînement terminé, modèle final sauvegardé.")

if __name__ == "__main__":
    main()
