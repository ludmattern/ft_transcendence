from dataclasses import dataclass
import random
import time
import logging
from typing import Dict

logger = logging.getLogger(__name__)


@dataclass
class Vector3D:
    x: float
    y: float
    z: float

    def add(self, other: "Vector3D") -> "Vector3D":
        return Vector3D(self.x + other.x, self.y + other.y, self.z + other.z)

    def scale(self, factor: float) -> "Vector3D":
        return Vector3D(self.x * factor, self.y * factor, self.z * factor)

    def magnitude(self) -> float:
        return (self.x**2 + self.y**2 + self.z**2) ** 0.5

    def normalize(self) -> "Vector3D":
        mag = self.magnitude()
        return self if mag == 0 else self.scale(1 / mag)


@dataclass
class Ball:
    position: Vector3D
    velocity: Vector3D
    size: float


@dataclass
class Player:
    player_id: str
    paddle_position: Vector3D


@dataclass
class GameState:
    ball: Ball
    players: Dict[int, Player]
    scores: Dict[int, int]
    waiting_for_start: bool = True
    ball_waiting: bool = False
    ball_following_paddle: bool = False


class BasePongGame:
    START_DELAY = 3.0
    MAX_SCORE = 10
    BALL_RESET_DELAY = 1.0
    BALL_INITIAL_SPEED = 1.5
    VMAX = 5.0
    MIN_SPEED = 1.5
    STEP = 1.1

    TUNNEL_WIDTH = 5
    TUNNEL_HEIGHT = 1.5
    TUNNEL_DEPTH = 1.5
    PADDLE_WIDTH = 0.07
    PADDLE_HEIGHT = 0.33
    PADDLE_DEPTH = 0.33

    BALL_SIZE = 0.1

    def __init__(self, game_id: str, player1_id: str = None, player2_id: str = None):
        self.game_id = game_id
        self.start_time = time.time()
        self.last_update = self.start_time
        self.game_over = False
        self.quitter_id = None

        self.player1_id = player1_id if player1_id else "unknown1"
        self.player2_id = player2_id if player2_id else "unknown2"

        self.user_scores = {self.player1_id: 0, self.player2_id: 0}
        self.player_mapping = {self.player1_id: 1, self.player2_id: 2}
        self.movement_state = {
            1: {"up": False, "down": False, "left": False, "right": False},
            2: {"up": False, "down": False, "left": False, "right": False},
        }
        ball_velocity = Vector3D(
            random.choice([-self.BALL_INITIAL_SPEED, self.BALL_INITIAL_SPEED]),
            random.uniform(-1, 1),
            random.uniform(-1, 1),
        )
        ball = Ball(position=Vector3D(0, 0, 0), velocity=ball_velocity, size=self.BALL_SIZE)

        players = {
            1: Player(
                player_id=self.player1_id,
                paddle_position=Vector3D(-self.TUNNEL_WIDTH / 2.2, 0, 0),
            ),
            2: Player(
                player_id=self.player2_id,
                paddle_position=Vector3D(self.TUNNEL_WIDTH / 2.2, 0, 0),
            ),
        }
        scores = {1: 0, 2: 0}

        self.state = GameState(ball=ball, players=players, scores=scores)
        self.ball_hit_paddle = False
        self.ball_hit_wall = False
        if game_id is not None:
            self.solo_mode = game_id.startswith("solo_")
        else:
            self.solo_mode = False
        self.scoring_player: int = 0
        self.ball_reset_time: float = 0.0

    def is_solo_mode(self) -> bool:
        return self.solo_mode

    def set_movement(self, player_num: int, direction: str, moving: bool) -> None:
        """set movement"""
        if player_num not in self.movement_state:
            self.movement_state[player_num] = {"up": False, "down": False, "left": False, "right": False}
        self.movement_state[player_num][direction] = moving

    def move_paddle(self, player_num: int, direction: str, dt: float = 1.0) -> None:
        """move paddle"""
        if player_num not in self.state.players:
            return
        player = self.state.players[player_num]
        pos = player.paddle_position

        step = self.STEP * dt

        if direction == "up":
            pos.y = min(self.TUNNEL_HEIGHT / 2 - self.PADDLE_HEIGHT / 2, pos.y + step)
        elif direction == "down":
            pos.y = max(-self.TUNNEL_HEIGHT / 2 + self.PADDLE_HEIGHT / 2, pos.y - step)
        elif direction == "left":
            pos.z = max(-self.TUNNEL_DEPTH / 2 + self.PADDLE_DEPTH / 2, pos.z - step)
        elif direction == "right":
            pos.z = min(self.TUNNEL_DEPTH / 2 - self.PADDLE_DEPTH / 2, pos.z + step)

    def update(self, dt: float) -> None:
        """update game state"""
        if self.game_over:
            return

        self.ball_hit_paddle = False
        self.ball_hit_wall = False

        for player_num, moves in self.movement_state.items():
            for direction, active in moves.items():
                if active:
                    self.move_paddle(player_num, direction, dt)
        elapsed_since_start = time.time() - self.start_time
        if elapsed_since_start < self.START_DELAY:
            self.state.waiting_for_start = True
            return
        else:
            self.state.waiting_for_start = False

        if self.state.ball_waiting:
            self._update_ball_waiting(time.time())
            return

        self._update_ball_position(dt)
        self._limit_ball_speed()
        self._handle_wall_collisions()
        self._handle_paddle_collisions_and_scoring()

        if self.user_scores[self.player1_id] >= self.MAX_SCORE or self.user_scores[self.player2_id] >= self.MAX_SCORE:
            self.game_over = True

    def _update_ball_waiting(self, now: float) -> None:
        """update ball waiting"""
        if now - self.ball_reset_time < self.BALL_RESET_DELAY:
            if self.state.ball_following_paddle:
                paddle = self.state.players[self.scoring_player]
                lerp_factor = 0.1
                offset_x = 0.5 if self.scoring_player == 1 else -0.5

                ball = self.state.ball
                paddle_pos = paddle.paddle_position

                ball.position.x += (paddle_pos.x + offset_x - ball.position.x) * lerp_factor
                ball.position.y += (paddle_pos.y - ball.position.y) * lerp_factor
                ball.position.z += (paddle_pos.z - ball.position.z) * lerp_factor
            return
        else:
            paddle = self.state.players[self.scoring_player]
            offset_x = 0.5 if self.scoring_player == 1 else -0.5

            ball = self.state.ball
            paddle_pos = paddle.paddle_position

            ball.position.x = paddle_pos.x + offset_x
            ball.position.y = paddle_pos.y
            ball.position.z = paddle_pos.z

            self.state.ball_waiting = False
            self.state.ball_following_paddle = False

            speed_factor = 1.1
            direction = 1 if self.scoring_player == 1 else -1
            ball.velocity.x = self.BALL_INITIAL_SPEED * speed_factor * direction

    def _update_ball_position(self, dt: float) -> None:
        """update ball position"""
        ball = self.state.ball
        ball.position.x += ball.velocity.x * dt
        ball.position.y += ball.velocity.y * dt
        ball.position.z += ball.velocity.z * dt

    def _limit_ball_speed(self) -> None:
        """limit ball speed"""
        ball = self.state.ball
        speed = ball.velocity.magnitude()
        if speed > self.VMAX:
            factor = self.VMAX / speed
            ball.velocity = ball.velocity.scale(factor)
        elif speed < self.MIN_SPEED:
            factor = self.MIN_SPEED / speed
            ball.velocity = ball.velocity.scale(factor)

        if abs(ball.velocity.x) < self.MIN_SPEED:
            ball.velocity.x = self.MIN_SPEED if ball.velocity.x >= 0 else -self.MIN_SPEED

    def _handle_wall_collisions(self) -> None:
        """handle wall collisions"""
        ball = self.state.ball
        radius = ball.size / 2

        if ball.position.y + radius >= self.TUNNEL_HEIGHT / 2:
            ball.position.y = self.TUNNEL_HEIGHT / 2 - radius
            ball.velocity.y *= -1
            self.ball_hit_wall = True
        elif ball.position.y - radius <= -self.TUNNEL_HEIGHT / 2:
            ball.position.y = -self.TUNNEL_HEIGHT / 2 + radius
            ball.velocity.y *= -1
            self.ball_hit_wall = True

        if ball.position.z + radius >= self.TUNNEL_DEPTH / 2:
            ball.position.z = self.TUNNEL_DEPTH / 2 - radius
            ball.velocity.z *= -1
            self.ball_hit_wall = True
        elif ball.position.z - radius <= -self.TUNNEL_DEPTH / 2:
            ball.position.z = -self.TUNNEL_DEPTH / 2 + radius
            ball.velocity.z *= -1
            self.ball_hit_wall = True

    def _handle_paddle_collisions_and_scoring(self) -> None:
        """handle paddle collisions and scoring"""
        ball = self.state.ball
        radius = ball.size / 2
        p1 = self.state.players[1]
        p2 = self.state.players[2]
        margin = 0.1

        if ball.position.x - radius <= p1.paddle_position.x + self.PADDLE_WIDTH:
            if (p1.paddle_position.y - self.PADDLE_HEIGHT / 2 - radius <= ball.position.y <= p1.paddle_position.y + self.PADDLE_HEIGHT / 2 + radius) and (p1.paddle_position.z - self.PADDLE_DEPTH / 2 - radius <= ball.position.z <= p1.paddle_position.z + self.PADDLE_DEPTH / 2 + radius):
                impact_y = (ball.position.y - p1.paddle_position.y) / (self.PADDLE_HEIGHT / 2)
                impact_z = (ball.position.z - p1.paddle_position.z) / (self.PADDLE_DEPTH / 2)

                ball.velocity.x = abs(ball.velocity.x) * 1.05
                ball.velocity.y += impact_y * 0.75
                ball.velocity.z += impact_z * 0.75
                self.ball_hit_paddle = True

            elif ball.position.x <= p1.paddle_position.x - margin:
                scoring_player_id = self.player2_id
                self.user_scores[scoring_player_id] += 1
                self.state.scores[self.player_mapping[scoring_player_id]] += 1
                self._reset_ball("right")

        if ball.position.x + radius >= p2.paddle_position.x - self.PADDLE_WIDTH:
            if (p2.paddle_position.y - self.PADDLE_HEIGHT / 2 - radius <= ball.position.y <= p2.paddle_position.y + self.PADDLE_HEIGHT / 2 + radius) and (p2.paddle_position.z - self.PADDLE_DEPTH / 2 - radius <= ball.position.z <= p2.paddle_position.z + self.PADDLE_DEPTH / 2 + radius):
                impact_y = (ball.position.y - p2.paddle_position.y) / (self.PADDLE_HEIGHT / 2)
                impact_z = (ball.position.z - p2.paddle_position.z) / (self.PADDLE_DEPTH / 2)

                ball.velocity.x = -abs(ball.velocity.x) * 1.07
                ball.velocity.y += impact_y * 0.75
                ball.velocity.z += impact_z * 0.75
                self.ball_hit_paddle = True

            elif ball.position.x >= p2.paddle_position.x + margin:
                scoring_player_id = self.player1_id
                self.user_scores[scoring_player_id] += 1
                self.state.scores[self.player_mapping[scoring_player_id]] += 1
                self._reset_ball("left")

    def _reset_ball(self, direction: str = "right") -> None:
        """reset ball"""
        self.scoring_player = 1 if direction == "right" else 2
        self.state.ball_waiting = True
        self.state.ball_following_paddle = True
        self.ball_reset_time = time.time()

        self.state.ball.velocity = Vector3D(0, 0, 0)

    def to_dict(self) -> dict:
        """convert game state to dictionary for front"""
        return {
            "ball": {
                "x": self.state.ball.position.x,
                "y": self.state.ball.position.y,
                "z": self.state.ball.position.z,
                "vx": self.state.ball.velocity.x,
                "vy": self.state.ball.velocity.y,
                "vz": self.state.ball.velocity.z,
            },
            "players": {
                str(num): {
                    "x": player.paddle_position.x,
                    "y": player.paddle_position.y,
                    "z": player.paddle_position.z,
                }
                for num, player in self.state.players.items()
            },
            "scores": {str(num): score for num, score in self.state.scores.items()},
            "user_scores": {
                self.player1_id: self.user_scores.get(self.player1_id, 0),
                self.player2_id: self.user_scores.get(self.player2_id, 0),
            },
            "game_over": self.game_over,
            "ball_hit_paddle": self.ball_hit_paddle,
            "ball_hit_wall": self.ball_hit_wall,
        }
