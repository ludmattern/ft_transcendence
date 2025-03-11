# -- TODO --
# IN ORDER TO TRAIN AI
## Create and navigate to the new directory in ~goinfre/
mkdir -p ~/goinfre/ft_transcendence
cd ~/goinfre/ft_transcendence

## Create and activate a virtual environment in ~goinfre/
python3 -m venv venv
source venv/bin/activate

## Install stable-baselines3 and other dependencies
pip install stable-baselines3 gym numpy torch

## Run the training script from its original location
python3 ~/42/ft_transcendence/IA/train_pong3d.py


IA: MODELS NEED TO BE SMART ENOUGH

-- CLEANUP --
-- FINAL REVIEW --

# -- CLOSED --
FRIEND_LIST + GESTION ADD/BLOCK/INVITE + CONDITION DANS LE BROADCAST + PAGE SOCIAL (DONE)
LIVECHAT
    -> RETOUCHER AU BROADCAST POUR GERER LES FUTUR USERS QUI SONT BLOCKED (DONE)
CHECK HTTPS only for Backend too. (DONE)
CAN INJECT SQL REQUEST THX TO IMAGE UPLOAD. (DONE)
CAN INJECT SQL REQUEST WITH </ > </> directly as a message in the livechat input field (DONE)
Check requirements for each dockerfile and give version for each of those which doesn't (DONE)

NEED TO SETUP tournament-service in order to start making back views/consumers for infoPanel purposes. (tournament invite and private games) (DONE)
NEED TO IMPLEMENT infoPanelItem different behaviors... (DONE) 
--> OBJECTIVES (Faire les tests de block/friend, private game invite) (DONE)
SETTINGS:
        - 42AUTH SHOULD HAVE A DIFFERENT LOGIC IN ORDER TO CHANGE USERNAME ONLY. (As this user doesn't and won't have a current password) (DONE)

SOCIAL: - SHOULD NOT "FIND" USER IF YOU HAVE BEEN BLOCKED BY THAT USER (DONE)
        - CAN'T ADD AS FRIEND (SHOULD BE ALREADY MANAGED WITH ADD LOGIC) (DONE)

OTHERPROFILE:
        - SHOULD NOT BE ABLE TO LOOK AT OTHER PROFILE IF YOU'VE BEEN BLOCKED BY THAT SAME PERSON (DONE)
        - SHOULD NOT BE ABLE TO ADD IF BLOCKED (DONE)
        - SHOULD NOT BE ABLE TO BLOCK IF ALREADY BLOCK (DONE)
        - SHOULD BE ABLE TO UNBLOCK IF INITIATOR ONLY (SHOUDL MATCH LOGIC WITH FIRST BULLET POINT) (DONE)
        - SHOULD HAVE NORMAL REMOVE FRIEND/ADD FRIEND LOGIC (CHECK 2nd BULLET POINT JUST IN CASE) (DONE)