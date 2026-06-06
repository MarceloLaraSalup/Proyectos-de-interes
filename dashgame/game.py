import pygame
import random
import sys

# ── Constants ────────────────────────────────────────────────────────────────
WIDTH, HEIGHT = 900, 400
FPS = 60
GROUND_Y = 320

# Colors
BG_COLOR       = (15, 15, 25)
GROUND_COLOR   = (60, 60, 90)
PLAYER_COLOR   = (255, 200, 50)
OBSTACLE_COLOR = (220, 80, 80)
PARTICLE_COLOR = (255, 200, 50)
TEXT_COLOR     = (220, 220, 255)
ACCENT_COLOR   = (100, 100, 255)
GRID_COLOR     = (25, 25, 45)

GRAVITY       = 0.7
JUMP_FORCE    = -14
PLAYER_SIZE   = 32
BASE_SPEED    = 5
SPEED_INC     = 0.001   # speed increase per frame

# Obstacle sizes (width, height) per type
OBS_SIZES = {
    1: [(28, 28)],
    2: [(28, 28), (28, 28)],
    3: [(28, 28), (28, 28), (28, 28)],
}

# ── Procedural generation ────────────────────────────────────────────────────
def gen_obstacle(x, speed):
    """Return a list of pygame.Rect obstacles at position x."""
    kind = random.choices([1, 2, 3], weights=[50, 35, 15])[0]
    rects = []
    for i in range(kind):
        w, h = OBS_SIZES[kind][i]
        # stack obstacles side by side
        rx = x + i * (w + 4)
        ry = GROUND_Y - h
        rects.append(pygame.Rect(rx, ry, w, h))
    return rects


def draw_triangle(surface, color, rect):
    """Draw a filled triangle (spike) inside the given rect."""
    pts = [
        (rect.left,              rect.bottom),
        (rect.right,             rect.bottom),
        (rect.centerx,           rect.top),
    ]
    pygame.draw.polygon(surface, color, pts)
    # dark edge
    pygame.draw.polygon(surface, (150, 40, 40), pts, 2)


# ── Particles ────────────────────────────────────────────────────────────────
class Particle:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.vx = random.uniform(-2, 0)
        self.vy = random.uniform(-3, -1)
        self.life = random.randint(15, 30)
        self.max_life = self.life
        self.size = random.randint(3, 6)

    def update(self):
        self.x += self.vx
        self.y += self.vy
        self.vy += 0.15
        self.life -= 1

    def draw(self, surface):
        alpha = int(255 * (self.life / self.max_life))
        r, g, b = PARTICLE_COLOR
        color = (r, g, min(b + 50, 255))
        s = max(1, self.size - (self.max_life - self.life) // 5)
        pygame.draw.rect(surface, color, (int(self.x), int(self.y), s, s))


# ── Game ─────────────────────────────────────────────────────────────────────
class Game:
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        pygame.display.set_caption("DashCube")
        self.clock = pygame.time.Clock()

        self.font_big   = pygame.font.SysFont("monospace", 48, bold=True)
        self.font_med   = pygame.font.SysFont("monospace", 24, bold=True)
        self.font_small = pygame.font.SysFont("monospace", 16)

        self.reset()

    def reset(self):
        self.player    = pygame.Rect(120, GROUND_Y - PLAYER_SIZE, PLAYER_SIZE, PLAYER_SIZE)
        self.vy        = 0
        self.on_ground = True
        self.speed     = BASE_SPEED
        self.score     = 0
        self.hi_score  = getattr(self, "hi_score", 0)
        self.alive     = True
        self.started   = False

        self.obstacles  = []          # list of lists of rects
        self.particles  = []
        self.camera_x   = 0
        self.next_obs_x = WIDTH + 200
        self.bg_offset  = 0
        self.angle      = 0           # player rotation when on ground

    # ── Input ────────────────────────────────────────────────────────────────
    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit(); sys.exit()
            if event.type == pygame.KEYDOWN:
                if event.key in (pygame.K_SPACE, pygame.K_UP, pygame.K_w):
                    if not self.alive:
                        self.reset()
                        return
                    if not self.started:
                        self.started = True
                    if self.on_ground:
                        self.vy = JUMP_FORCE
                        self.on_ground = False

    # ── Update ───────────────────────────────────────────────────────────────
    def update(self):
        if not self.started or not self.alive:
            return

        self.speed += SPEED_INC
        self.camera_x += self.speed
        self.bg_offset = (self.bg_offset + self.speed * 0.3) % 80
        self.score += 1

        # Gravity
        self.vy += GRAVITY
        self.player.y += int(self.vy)

        # Ground clamp
        if self.player.y >= GROUND_Y - PLAYER_SIZE:
            self.player.y = GROUND_Y - PLAYER_SIZE
            self.vy = 0
            self.on_ground = True
        else:
            self.on_ground = False

        # Rotation (only on ground for the rolling feel)
        if self.on_ground:
            self.angle = (self.angle + self.speed * 3) % 360

        # Particles (trail)
        if self.on_ground and random.random() < 0.4:
            self.particles.append(
                Particle(self.player.right - 4, self.player.bottom - 4)
            )

        self.particles = [p for p in self.particles if p.life > 0]
        for p in self.particles:
            p.update()

        # Spawn obstacles
        while self.next_obs_x - self.camera_x < WIDTH + 100:
            obs = gen_obstacle(self.next_obs_x, self.speed)
            self.obstacles.append(obs)
            gap = random.randint(280, 480)
            self.next_obs_x += gap + obs[-1].right - obs[0].left

        # Remove off-screen obstacles
        self.obstacles = [
            grp for grp in self.obstacles
            if grp[-1].right - self.camera_x > -50
        ]

        # Collision
        for grp in self.obstacles:
            for rect in grp:
                draw_rect = rect.move(-int(self.camera_x), 0)
                # shrink hitbox slightly for fairness
                hitbox = self.player.inflate(-6, -6)
                if hitbox.colliderect(draw_rect):
                    self.alive = False
                    self.hi_score = max(self.hi_score, self.score)
                    # death burst
                    for _ in range(30):
                        self.particles.append(
                            Particle(self.player.centerx, self.player.centery)
                        )

    # ── Draw ─────────────────────────────────────────────────────────────────
    def draw_bg(self):
        self.screen.fill(BG_COLOR)
        # Scrolling grid lines
        for x in range(-int(self.bg_offset) % 80, WIDTH, 80):
            pygame.draw.line(self.screen, GRID_COLOR, (x, 0), (x, HEIGHT))
        for y in range(0, HEIGHT, 80):
            pygame.draw.line(self.screen, GRID_COLOR, (0, y), (WIDTH, y))

    def draw_ground(self):
        pygame.draw.rect(self.screen, GROUND_COLOR, (0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y))
        pygame.draw.line(self.screen, ACCENT_COLOR, (0, GROUND_Y), (WIDTH, GROUND_Y), 2)

    def draw_player(self):
        if not self.alive:
            return
        cx, cy = self.player.centerx, self.player.centery
        surf = pygame.Surface((PLAYER_SIZE, PLAYER_SIZE), pygame.SRCALPHA)
        pygame.draw.rect(surf, PLAYER_COLOR, (0, 0, PLAYER_SIZE, PLAYER_SIZE), border_radius=4)
        # inner detail lines
        pygame.draw.line(surf, (200, 150, 30), (6, 6), (PLAYER_SIZE - 6, 6), 2)
        pygame.draw.line(surf, (200, 150, 30), (6, PLAYER_SIZE - 6), (PLAYER_SIZE - 6, PLAYER_SIZE - 6), 2)
        rotated = pygame.transform.rotate(surf, -self.angle)
        rect = rotated.get_rect(center=(cx, cy))
        self.screen.blit(rotated, rect)

    def draw_obstacles(self):
        for grp in self.obstacles:
            for rect in grp:
                draw_rect = rect.move(-int(self.camera_x), 0)
                draw_triangle(self.screen, OBSTACLE_COLOR, draw_rect)

    def draw_particles(self):
        for p in self.particles:
            p.draw(self.screen)

    def draw_hud(self):
        score_surf = self.font_med.render(f"SCORE  {self.score // 10:05d}", True, TEXT_COLOR)
        hi_surf    = self.font_small.render(f"BEST  {self.hi_score // 10:05d}", True, ACCENT_COLOR)
        spd_surf   = self.font_small.render(f"SPD  {self.speed:.1f}", True, GROUND_COLOR)
        self.screen.blit(score_surf, (20, 16))
        self.screen.blit(hi_surf,    (20, 46))
        self.screen.blit(spd_surf,   (WIDTH - 120, 16))

    def draw_screens(self):
        if not self.started and self.alive:
            title  = self.font_big.render("DASHCUBE", True, PLAYER_COLOR)
            hint   = self.font_med.render("PRESS SPACE / ↑ TO START", True, TEXT_COLOR)
            self.screen.blit(title, title.get_rect(center=(WIDTH // 2, HEIGHT // 2 - 50)))
            self.screen.blit(hint,  hint.get_rect(center=(WIDTH // 2, HEIGHT // 2 + 20)))

        if not self.alive:
            over  = self.font_big.render("GAME OVER", True, OBSTACLE_COLOR)
            score = self.font_med.render(f"Score: {self.score // 10}", True, TEXT_COLOR)
            retry = self.font_med.render("PRESS SPACE TO RETRY", True, ACCENT_COLOR)
            self.screen.blit(over,  over.get_rect(center=(WIDTH // 2, HEIGHT // 2 - 60)))
            self.screen.blit(score, score.get_rect(center=(WIDTH // 2, HEIGHT // 2)))
            self.screen.blit(retry, retry.get_rect(center=(WIDTH // 2, HEIGHT // 2 + 50)))

    def run(self):
        while True:
            self.handle_events()
            self.update()

            self.draw_bg()
            self.draw_ground()
            self.draw_particles()
            self.draw_obstacles()
            self.draw_player()
            self.draw_hud()
            self.draw_screens()

            pygame.display.flip()
            self.clock.tick(FPS)


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    Game().run()
