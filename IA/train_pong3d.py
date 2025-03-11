import os
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import SubprocVecEnv, VecNormalize
from env_pong3d import Pong3DEnv

# 📁 Chemin des sauvegardes et logs
SAVE_PATH = "./models/pong3d_agent"
LOG_DIR = "./logs"
CHECKPOINT_INTERVAL = 400_000 
N_ENVS = 8

def make_env():
    return Pong3DEnv(frame_skip=4, max_steps=50000)

def main():
    print("🚀 Initialisation des environnements...")
    env = SubprocVecEnv([lambda: make_env() for _ in range(N_ENVS)])
    env = VecNormalize(env, norm_obs=True, norm_reward=True, clip_obs=10.0)

    if os.path.exists(SAVE_PATH + ".zip"):
        print("🔄 Chargement du modèle existant...")
        model = PPO.load(SAVE_PATH, env)
    else:
        print("🚀 Création d'un nouveau modèle...")
        model = PPO(
            "MlpPolicy", env, verbose=1,
            n_steps=4096,  # 🔼 Fréquence des mises à jour (plus fréquent pour un bon début)
            batch_size=256,  # 🔼 Augmenté pour une meilleure stabilité
            learning_rate=0.0003,  # 🔼 Apprentissage légèrement plus rapide au début
            ent_coef=0.01,  # 🔽 Réduit pour moins d'aléatoire
            vf_coef=0.6,  # 🔽 Légèrement réduit pour ne pas donner trop d'importance à la Value Function
            clip_range=0.2,  # 🔽 Plus strict pour éviter des mises à jour trop agressives
            gae_lambda=0.95,  # 🔽 Légèrement réduit pour plus de stabilité
        )

    TIMESTEPS = 200_000  
    TOTAL_STEPS = 5_000_000 
    num_iterations = TOTAL_STEPS // TIMESTEPS  

    for i in range(1, num_iterations + 1):
        print(f"🛠️ Entraînement - Phase {i}/{num_iterations} ({TIMESTEPS * i} timesteps)...")
        model.learn(total_timesteps=TIMESTEPS, reset_num_timesteps=False, tb_log_name="PPO_Pong3D")

        if (i * TIMESTEPS) % CHECKPOINT_INTERVAL == 0:
            model.save(f"{SAVE_PATH}_checkpoint_{i}")
            print(f"📂 Modèle checkpoint sauvegardé après {i * TIMESTEPS} steps")

    model.save(SAVE_PATH + "_final")
    print("🎉 Entraînement terminé, modèle final sauvegardé.")

if __name__ == "__main__":
    main()
