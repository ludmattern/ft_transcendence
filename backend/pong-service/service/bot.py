def ai_decision(game, ai_player_id):
    player_num = game.player_mapping[ai_player_id]
    paddle = game.state["players"][player_num]
    ball = game.state["ball"]

    ball_coming_toward_ai = False
    if player_num == 2 and ball["vx"] > 0:
        ball_coming_toward_ai = True
    elif player_num == 1 and ball["vx"] < 0:
        ball_coming_toward_ai = True

    if not ball_coming_toward_ai:
        target_y = 0.0
        target_z = 0.0
    else:
        dx = (paddle["x"] - ball["x"])  
        vx = ball["vx"]
        if abs(vx) < 1e-6:
            return paddle["y"], paddle["z"] 

        time_to_reach = dx / vx
        if time_to_reach < 0:
            return paddle["y"], paddle["z"] 

        predicted_y = ball["y"] + ball["vy"] * time_to_reach
        predicted_z = ball["z"] + ball["vz"] * time_to_reach

        target_y = max(-game.tunnel_height / 2 + game.paddle_height / 2,
                       min(game.tunnel_height / 2 - game.paddle_height / 2, predicted_y))
        target_z = max(-game.tunnel_depth / 2 + game.paddle_depth / 2,
                       min(game.tunnel_depth / 2 - game.paddle_depth / 2, predicted_z))

    return target_y, target_z

