# TOURNAMENT

**TOUT EN CONSUMERS SAUF LE CURRENT TOURNAMENT EN VIEW**

---

## Création

### Local

#### WSS
- **Créer un tournoi avec les pseudos** (en fonction du format 4-8-16).
- Une fois rempli, on peut créer le tournoi côté backend via une view.
  - **Type:** `local`
  - **Format:** `'4'` / `'8'` / `'16'` (OK)
  - **Player_list:** `{host, guest1, guest2, guest3}` par exemple (OK)
- **Shuffle** la liste et remplir la DB avec celle-ci → **Tournament-participants**
- **Création de toutes les sessions de jeux**  
  (via Tournament-service ? utilisation de matchmaking-service)
- Remplir les tables de la DB.

#### API_REST (Requête de Current Tournament)
- **Création de l'arbre (brackets) :**  
  Pour les joueurs en attente des parties à jouer.
- **Response :**  
  Un JSON généré par `get_current_tournament` dans le backend (se baser sur le fichier `currentTournament.js`).

#### JOIN GAME  
*(En utilisant l'existant du matchmaking PRIVATE BATTLE)*
- Sur **game-over**, mettre à jour le tournoi en fonction des winners dans les futurs matchs (actuellement vide du tournoi).
  - Si la partie suivante est prête à deux joueurs, créer la session de jeu et envoyer les invitations  
    *(dans la partie INFO, livechat-service)*.
  - Si c'est la finale, nettoyer le tournoi et les parties correspondantes.
  - Conserver l'historique des matchs (utilisation de la table `game_history`) à chaque fin de match  
    *(ne pas stocker si le score est de 0-0)*.

#### Give Up Tournament *(Bouton GIVE UP TOURNAMENT)*
- Mettre directement ce joueur en loser dans sa prochaine partie non jouée  
  *(par exemple, s'il doit attendre l'autre joueur ou si la partie est prête et qu'il souhaite abandonner)*.
  - **Actions :**  
    - Destruction de la session de jeu, game over.
    - Ajout d'un status de fin de partie.
    - Envoi d'une réponse JSON particulière pour la gestion côté front à son opposant  
      *(pour le faire sortir de l'attente s'il y est, sinon supprimer l'invitation)*.
- Si c'est l'avant-dernier joueur restant du tournoi, le dernier joueur devient gagnant du tournoi.
- S'assurer que les vues ne puissent pas être appelées simultanément par deux joueurs  
  *(les bufferiser pour les avoir dans l'ordre)*.

#### Timeout
- **Pas de timeout :**  
  Si trop long → Ragequit et le tournoi continue.

---

### Online

#### Host

**CREATE**
- Utilisation du WSS (channels) avec le canal: `tournoi_${host_id}`.
- En consumers, gérer les actions : `invite`, `kick`, `start`, `cancel`.
  - **cancel :**  
    - Discard tous les joueurs qui ont rejoint ce canal.
    - Annuler les invitations en cours.

#### Guests

- **JOIN :**  
  Le joueur rejoint le canal du host.
- **QUIT :**  
  Le joueur est retiré (discard) du canal.

#### Paramètres du Tournoi Online
- **Type :** `'online'`
- **Format :** `'4'` / `'8'` / `'16'`
- **Player_list :** `{host, guest1, guest2, guest3}` (avec les ID)
- **Shuffle** la liste et remplir la DB → **Tournament-participants**
- **Création de toutes les sessions de jeux**  
  *(via Tournament-service ? utilisation de matchmaking-service)*
- Remplir les tables de la DB.

#### API_REST
- **Création de l'arbre (brackets) :**  
  Pour les joueurs en attente des parties à jouer.
- **Response :**  
  Un JSON généré par `get_current_tournament` dans le backend (se baser sur le fichier `currentTournament.js`).

#### JOIN GAME  
*(En utilisant l'existant du matchmaking PRIVATE BATTLE)*
- Sur **game-over**, mettre à jour le tournoi en fonction des winners dans les futurs matchs (actuellement vide du tournoi).
  - Si la partie suivante est prête à deux joueurs, créer la session de jeu et envoyer les invitations  
    *(dans la partie INFO, livechat-service)*.
  - Si c'est la finale, nettoyer le tournoi et les parties correspondantes.
  - Conserver l'historique des matchs (utilisation de la table `game_history`) à chaque fin de match  
    *(ne pas stocker si le score est de 0-0)*.

#### Give Up Tournament *(Bouton GIVE UP TOURNAMENT)*
- Mettre directement ce joueur en loser dans sa prochaine partie non jouée  
  *(par exemple, s'il doit attendre l'autre joueur ou si la partie est prête et qu'il souhaite abandonner)*.
  - **Actions :**  
    - Destruction de la session de jeu, game over.
    - Ajout d'un status de fin de partie.
    - Envoi d'une réponse JSON particulière pour la gestion côté front à son opposant  
      *(pour le faire sortir de l'attente s'il y est, sinon supprimer l'invitation)*.
- Si c'est l'avant-dernier joueur restant du tournoi, le dernier joueur devient gagnant du tournoi.
- S'assurer que les vues ne puissent pas être appelées simultanément par deux joueurs  
  *(les bufferiser pour les avoir dans l'ordre)*.

