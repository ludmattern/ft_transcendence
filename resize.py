from PIL import Image

# Ouvrir l'image
img = Image.open("frontend/src/assets/img/bluesceen.png")

# Redimensionner en 4K
img_resized = img.resize((4000, 2000))

# Sauvegarder l'image redimensionnée
img_resized.save("frontend/src/assets/img/bluesceen3.png")

print("Image redimensionnée avec succès !")
