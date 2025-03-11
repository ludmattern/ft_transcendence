import torch
import onnx
from stable_baselines3 import PPO

# Charger le modèle entraîné
MODEL_PATH = "./models/pong3d_agent.zip"
model = PPO.load(MODEL_PATH)

# Exemple d'entrée (taille de l'observation)
dummy_input = torch.randn(1, 10, dtype=torch.float32)

# Chemin du modèle ONNX
ONNX_PATH = "./models/pong3d_agent.onnx"

# Exporter en ONNX
torch.onnx.export(
    model.policy,  
    dummy_input,
    ONNX_PATH,
    opset_version=11,
    input_names=["input"],
    output_names=["output"]
)

print(f"✅ Modèle exporté en ONNX : {ONNX_PATH}")
