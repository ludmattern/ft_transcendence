from PIL import Image

# Ouvrir l'image
img = Image.open("frontend/src/assets/models/tst/textures/image_5.png")

# Redimensionner en 4K
img_resized = img.resize((2048, 2048))

# Sauvegarder l'image redimensionnée
img_resized.save("frontend/src/assets/models/tst/textures/image_52.png")

print("Image redimensionnée avec succès !")
