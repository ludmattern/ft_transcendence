# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: lmattern <lmattern@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/07/13 16:31:02 by lmattern          #+#    #+#              #
#    Updated: 2024/10/10 16:50:08 by lmattern         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Nom du projet
PROJECT_NAME = ft_transcendence

# Définir les cibles
.PHONY: all build up down clean re

# Par défaut, construire et démarrer les conteneurs
all: up

# Construire les images
build:
	docker-compose -f srcs/docker-compose.yml build

# Démarrer les conteneurs
up: build
	docker-compose -f srcs/docker-compose.yml up -d

# Arrêter les conteneurs
down:
	docker-compose -f srcs/docker-compose.yml down

# Nettoyer les conteneurs, les images, les réseaux et les volumes
clean: down
	docker system prune -af --volumes
	docker volume rm $$(docker volume ls -qf dangling=true)

# Reconstruire et redémarrer les conteneurs
re: clean up