import time
import random

class AIPaddle:
    def __init__(self, player_num, game, difficulty):
        self.player_num = player_num
        self.game = game
        self.difficulty = difficulty
        self.last_observation_time = 0
        self.target_y = 0
        self.target_z = 0
        self.last_move_time = 0
        self.start_time = time.time()
        if difficulty == "hard":
            self.allowed_to_observe = 1.0
        elif difficulty == "very-hard":
            self.allowed_to_observe = 0.5
        else:
            self.allowed_to_observe = 0.1
        

    def update(self):
        """Update the AI paddle's position."""
        now = time.time()

        if now - self.start_time < 3:
            return

        if now - self.last_observation_time >= self.allowed_to_observe:
            self.observe()
            self.last_observation_time = now

        self.move_towards_target()

    def observe(self):
        """Observe the ball and decide where to move the paddle."""
        ball = self.game.state.ball
        paddle = self.game.state.players[self.player_num]

        opponent_num = 1 if self.player_num == 2 else 2
        opponent_paddle = self.game.state.players[opponent_num]

        scoring_x = paddle.paddle_position.x
        ball_x, ball_y, ball_z = ball.position.x, ball.position.y, ball.position.z
        vel_x, vel_y, vel_z = ball.velocity.x, ball.velocity.y, ball.velocity.z

        ball_coming_towards_ia = (self.player_num == 1 and vel_x < 0) or (self.player_num == 2 and vel_x > 0)

        if ball_coming_towards_ia:
            if vel_x == 0:
                return  

            time_to_impact = abs((scoring_x - ball_x) / vel_x)
            time_step = 0.0167
            sim_time = 0

            while sim_time < time_to_impact:
                ball_x += vel_x * time_step
                ball_y += vel_y * time_step
                ball_z += vel_z * time_step
                sim_time += time_step

                if ball_y + self.game.BALL_SIZE >= self.game.TUNNEL_HEIGHT / 2:
                    ball_y = self.game.TUNNEL_HEIGHT / 2 - self.game.BALL_SIZE
                    vel_y *= -1
                elif ball_y - self.game.BALL_SIZE <= -self.game.TUNNEL_HEIGHT / 2:
                    ball_y = -self.game.TUNNEL_HEIGHT / 2 + self.game.BALL_SIZE
                    vel_y *= -1

                if ball_z + self.game.BALL_SIZE >= self.game.TUNNEL_DEPTH / 2:
                    ball_z = self.game.TUNNEL_DEPTH / 2 - self.game.BALL_SIZE
                    vel_z *= -1
                elif ball_z - self.game.BALL_SIZE <= -self.game.TUNNEL_DEPTH / 2:
                    ball_z = -self.game.TUNNEL_DEPTH / 2 + self.game.BALL_SIZE
                    vel_z *= -1

            random_check = random.uniform(0, 1)
            opponent_score = self.game.state.scores[opponent_num]
            max_score = self.game.MAX_SCORE
            
            risk_factor = 1 - (opponent_score / max_score)

            max_risk = 0.99 * risk_factor
            min_risk = 0.8 * risk_factor
            angle_factor = random.uniform(min_risk, max_risk)

            if random_check < 0.5:
                target_y = ball_y - angle_factor * (self.game.PADDLE_HEIGHT / 2)
            else:
                target_y = ball_y + angle_factor * (self.game.PADDLE_HEIGHT / 2)

            if random_check < 0.5:
                target_z = ball_z + angle_factor * (self.game.PADDLE_DEPTH / 2)
            else:
                target_z = ball_z - angle_factor * (self.game.PADDLE_DEPTH / 2)

            self.target_y = target_y
            self.target_z = target_z

        else:
            self.target_y = opponent_paddle.paddle_position.y
            self.target_z = opponent_paddle.paddle_position.z

        self.target_y = max(-self.game.TUNNEL_HEIGHT / 2, min(self.target_y, self.game.TUNNEL_HEIGHT / 2))
        self.target_z = max(-self.game.TUNNEL_DEPTH / 2, min(self.target_z, self.game.TUNNEL_DEPTH / 2))

    def move_towards_target(self):
        paddle = self.game.state.players[self.player_num]
        threshold = 0.03 

        if paddle.paddle_position.y < self.target_y - threshold:
            self.game.set_movement(self.player_num, "up", True)
            self.game.set_movement(self.player_num, "down", False)
        elif paddle.paddle_position.y > self.target_y + threshold:
            self.game.set_movement(self.player_num, "down", True)
            self.game.set_movement(self.player_num, "up", False)
        else:
            self.game.set_movement(self.player_num, "up", False)
            self.game.set_movement(self.player_num, "down", False)

        if paddle.paddle_position.z < self.target_z - threshold:
            self.game.set_movement(self.player_num, "right", True)
            self.game.set_movement(self.player_num, "left", False)
        elif paddle.paddle_position.z > self.target_z + threshold:
            self.game.set_movement(self.player_num, "left", True)
            self.game.set_movement(self.player_num, "right", False)
        else:
            self.game.set_movement(self.player_num, "left", False)
            self.game.set_movement(self.player_num, "right", False)
