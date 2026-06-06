import pygame
import random
import sys
import math
 
# ── Valores ────────────────────────────────────────────────────────────────
WIDTH, HEIGHT = 1800, 800
FPS = 60
GROUND_Y = 600
 
# Colores
BG_COLOR       = (15, 15, 25)
GROUND_COLOR   = (60, 60, 90)
PLAYER_COLOR   = (255, 200, 50)
OBSTACLE_COLOR = (220, 80, 80)
TEXT_COLOR     = (220, 220, 255)
ACCENT_COLOR   = (100, 100, 255)
GRID_COLOR     = (25, 25, 45)
 
GRAVITY       = 0.7
JUMP_FORCE    = -17
PLAYER_SIZE   = 40
BASE_SPEED    = 5
SPEED_INC     = 0.0001
 
OBS_SIZES = {
    
    1: [(28, 33)],
    2: [(28, 33), (28, 33)],
    3: [(28, 33), (28, 33), (28, 33)],
}

 
PALETTE = [
    (255, 200,  50),  # amarillo
    (80,  200, 255),  # azul
    (80,  255, 140),  # verde
    (255,  80, 180),  # rosa
    (200,  80, 255),  # morado
    (255, 140,  40),  # naranja
    (255, 255, 255),  # blanco
    (80,   80, 255),  # indigo
]
 
SHAPES = ["cuadrado", "circulo", "triangulo"]
 
# ── Generacion Procedural ──────────────────────────────────────────────────
def gen_obstacle(x, speed):
    kind = random.choices([1, 2, 3], weights=[50, 35, 15])[0]
    rects = []
    for i in range(kind):
        w, h = OBS_SIZES[kind][i]
        rx = x + i * (w + 4)
        ry = GROUND_Y - h
        rects.append(pygame.Rect(rx, ry, w, h))
    return rects
 
def draw_triangle_obs(surface, color, rect):
    pts = [
        (rect.left,    rect.bottom),
        (rect.right,   rect.bottom),
        (rect.centerx, rect.top),
    ]
    pygame.draw.polygon(surface, color, pts)
    pygame.draw.polygon(surface, (150, 40, 40), pts, 2)
 
# ── UI helpers ─────────────────────────────────────────────────────────────
def draw_button(surface, font, text, rect, hovered):
    color  = (80, 80, 160) if hovered else (40, 40, 100)
    border = (150, 150, 255) if hovered else (80, 80, 180)
    pygame.draw.rect(surface, color,  rect, border_radius=10)
    pygame.draw.rect(surface, border, rect, 2, border_radius=10)
    label = font.render(text, True, TEXT_COLOR)
    surface.blit(label, label.get_rect(center=rect.center))
 
def draw_slider(surface, font, label, rect, value, min_v, max_v, active):
    pygame.draw.rect(surface, (30, 30, 60), rect, border_radius=6)
    border_col = (150, 150, 255) if active else (60, 60, 120)
    pygame.draw.rect(surface, border_col, rect, 2, border_radius=6)
    t = (value - min_v) / (max_v - min_v)
    handle_x = int(rect.x + t * rect.width)
    handle_x = max(rect.x + 8, min(rect.right - 8, handle_x))
    pygame.draw.circle(surface, ACCENT_COLOR, (handle_x, rect.centery), 10)
    lbl = font.render(f"{label}: {value:.3f}", True, TEXT_COLOR)
    surface.blit(lbl, (rect.x, rect.y - 22))
 
# ── Menu principal ─────────────────────────────────────────────────────────
class MainMenu:
    def __init__(self, screen, fonts):
        self.screen = screen
        self.font_big, self.font_med, self.font_small = fonts
        self.btn_apariencia  = pygame.Rect(WIDTH//2 - 220, HEIGHT//2 - 30, 200, 60)
        self.btn_personalizar = pygame.Rect(WIDTH//2 + 20,  HEIGHT//2 - 30, 200, 60)
        self.btn_jugar       = pygame.Rect(WIDTH//2 - 100,  HEIGHT//2 + 80, 200, 60)
 
    def run(self):
        clock = pygame.time.Clock()
        while True:
            mx, my = pygame.mouse.get_pos()
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit(); sys.exit()
                if event.type == pygame.MOUSEBUTTONDOWN:
                    if self.btn_apariencia.collidepoint(mx, my):
                        return "apariencia"
                    if self.btn_personalizar.collidepoint(mx, my):
                        return "personalizar"
                    if self.btn_jugar.collidepoint(mx, my):
                        return "jugar"
 
            self.screen.fill(BG_COLOR)
            title = self.font_big.render("GeometrySlide", True, PLAYER_COLOR)
            self.screen.blit(title, title.get_rect(center=(WIDTH//2, HEIGHT//2 - 130)))
 
            draw_button(self.screen, self.font_med, "Apariencia",
                        self.btn_apariencia, self.btn_apariencia.collidepoint(mx, my))
            draw_button(self.screen, self.font_med, "Personalizar",
                        self.btn_personalizar, self.btn_personalizar.collidepoint(mx, my))
            draw_button(self.screen, self.font_med, "▶  Jugar",
                        self.btn_jugar, self.btn_jugar.collidepoint(mx, my))
 
            hint = self.font_small.render("SPACE para jugar directamente", True, (80, 80, 120))
            self.screen.blit(hint, hint.get_rect(center=(WIDTH//2, HEIGHT - 40)))
            pygame.display.flip()
            clock.tick(FPS)
 
            keys = pygame.key.get_pressed()
            if keys[pygame.K_SPACE]:
                return "jugar"
 
# ── Menu Apariencia ────────────────────────────────────────────────────────
class AparienciaMenu:
    def __init__(self, screen, fonts, config):
        self.screen = screen
        self.font_big, self.font_med, self.font_small = fonts
        self.config = config
        self.btn_back = pygame.Rect(40, 40, 140, 50)
 
        # Botones de forma
        self.shape_btns = []
        for i, shape in enumerate(SHAPES):
            r = pygame.Rect(WIDTH//2 - 260 + i * 200, HEIGHT//2 - 60, 160, 160)
            self.shape_btns.append((r, shape))
 
        # Botones de color (paleta)
        self.color_btns = []
        for i, col in enumerate(PALETTE):
            cx = WIDTH//2 - (len(PALETTE) * 70)//2 + i * 70 + 35
            r = pygame.Rect(cx - 25, HEIGHT//2 + 140, 50, 50)
            self.color_btns.append((r, col))
 
    def draw_shape_preview(self, surface, shape, color, rect):
        cx, cy = rect.centerx, rect.centery
        size = 60
        if shape == "cuadrado":
            r = pygame.Rect(cx - size//2, cy - size//2, size, size)
            pygame.draw.rect(surface, color, r, border_radius=6)
            pygame.draw.rect(surface, (255,255,255,80), r, 2, border_radius=6)
        elif shape == "circulo":
            pygame.draw.circle(surface, color, (cx, cy), size//2)
            pygame.draw.circle(surface, (255,255,255), (cx, cy), size//2, 2)
        elif shape == "triangulo":
            pts = [(cx, cy - size//2), (cx - size//2, cy + size//2), (cx + size//2, cy + size//2)]
            pygame.draw.polygon(surface, color, pts)
            pygame.draw.polygon(surface, (255,255,255), pts, 2)
 
    def run(self):
        clock = pygame.time.Clock()
        while True:
            mx, my = pygame.mouse.get_pos()
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit(); sys.exit()
                if event.type == pygame.MOUSEBUTTONDOWN:
                    if self.btn_back.collidepoint(mx, my):
                        return
                    for r, shape in self.shape_btns:
                        if r.collidepoint(mx, my):
                            self.config["shape"] = shape
                    for r, col in self.color_btns:
                        if r.collidepoint(mx, my):
                            self.config["color"] = col
 
            self.screen.fill(BG_COLOR)
            draw_button(self.screen, self.font_small, "← Volver",
                        self.btn_back, self.btn_back.collidepoint(mx, my))
 
            title = self.font_med.render("Elige forma y color", True, TEXT_COLOR)
            self.screen.blit(title, title.get_rect(center=(WIDTH//2, HEIGHT//2 - 150)))
 
            for r, shape in self.shape_btns:
                selected = self.config["shape"] == shape
                border = (200, 200, 255) if selected else (60, 60, 100)
                bg     = (40, 40, 80)   if selected else (20, 20, 50)
                pygame.draw.rect(self.screen, bg,     r, border_radius=12)
                pygame.draw.rect(self.screen, border, r, 3, border_radius=12)
                self.draw_shape_preview(self.screen, shape, self.config["color"], r)
                lbl = self.font_small.render(shape.capitalize(), True, TEXT_COLOR)
                self.screen.blit(lbl, lbl.get_rect(center=(r.centerx, r.bottom + 18)))
 
            col_title = self.font_small.render("Color del personaje:", True, TEXT_COLOR)
            self.screen.blit(col_title, col_title.get_rect(center=(WIDTH//2, HEIGHT//2 + 110)))
 
            for r, col in self.color_btns:
                pygame.draw.rect(self.screen, col, r, border_radius=8)
                if self.config["color"] == col:
                    pygame.draw.rect(self.screen, (255,255,255), r, 3, border_radius=8)
 
            pygame.display.flip()
            clock.tick(FPS)
 
# ── Menu Personalizar ──────────────────────────────────────────────────────
class PersonalizarMenu:
    def __init__(self, screen, fonts, config):
        self.screen = screen
        self.font_big, self.font_med, self.font_small = fonts
        self.config = config
        self.btn_back = pygame.Rect(40, 40, 140, 50)
        self.btn_reset = pygame.Rect(WIDTH - 200, 40, 160, 50)
 
        # Sliders: (key, label, min, max, y)
        cy = HEIGHT//2 - 80
        self.sliders = [
            {"key": "base_speed",  "label": "Velocidad inicial", "min": 1.0,   "max": 20.0,  "y": cy},
            {"key": "gravity",     "label": "Gravedad",          "min": 0.1,   "max": 3.0,   "y": cy + 100},
            {"key": "jump_force",  "label": "Fuerza de salto",   "min": -30.0, "max": -5.0,  "y": cy + 200},
            {"key": "speed_inc",   "label": "Aceleracion",       "min": 0.0,   "max": 0.01,  "y": cy + 300},
        ]
        self.active_slider = None
 
    def run(self):
        clock = pygame.time.Clock()
        while True:
            mx, my = pygame.mouse.get_pos()
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit(); sys.exit()
                if event.type == pygame.MOUSEBUTTONDOWN:
                    if self.btn_back.collidepoint(mx, my):
                        return
                    if self.btn_reset.collidepoint(mx, my):
                        self.config["base_speed"] = BASE_SPEED
                        self.config["gravity"]    = GRAVITY
                        self.config["jump_force"] = JUMP_FORCE
                        self.config["speed_inc"]  = SPEED_INC
                    for s in self.sliders:
                        r = pygame.Rect(WIDTH//2 - 300, s["y"], 600, 20)
                        if r.collidepoint(mx, my):
                            self.active_slider = s["key"]
                if event.type == pygame.MOUSEBUTTONUP:
                    self.active_slider = None
                if event.type == pygame.MOUSEMOTION and self.active_slider:
                    for s in self.sliders:
                        if s["key"] == self.active_slider:
                            r = pygame.Rect(WIDTH//2 - 300, s["y"], 600, 20)
                            t = max(0.0, min(1.0, (mx - r.x) / r.width))
                            val = s["min"] + t * (s["max"] - s["min"])
                            self.config[s["key"]] = round(val, 4)
 
            self.screen.fill(BG_COLOR)
            draw_button(self.screen, self.font_small, "← Volver",
                        self.btn_back, self.btn_back.collidepoint(mx, my))
            draw_button(self.screen, self.font_small, "Resetear",
                        self.btn_reset, self.btn_reset.collidepoint(mx, my))
 
            title = self.font_med.render("Personalizar parámetros", True, TEXT_COLOR)
            self.screen.blit(title, title.get_rect(center=(WIDTH//2, HEIGHT//2 - 180)))
 
            for s in self.sliders:
                r = pygame.Rect(WIDTH//2 - 300, s["y"], 600, 20)
                active = self.active_slider == s["key"]
                draw_slider(self.screen, self.font_small,
                            s["label"], r,
                            self.config[s["key"]],
                            s["min"], s["max"], active)
 
            pygame.display.flip()
            clock.tick(FPS)
 
# ── Game ───────────────────────────────────────────────────────────────────
class Game:
    def __init__(self, screen, fonts, config):
        self.screen = screen
        self.font_big, self.font_med, self.font_small = fonts
        self.config = config
        self.clock = pygame.time.Clock()
        self.reset()
 
    def reset(self):
        self.player    = pygame.Rect(120, GROUND_Y - PLAYER_SIZE, PLAYER_SIZE, PLAYER_SIZE)
        self.vy        = 0
        self.on_ground = True
        self.speed     = self.config["base_speed"]
        self.score     = 0
        self.hi_score  = getattr(self, "hi_score", 0)
        self.alive     = True
        self.started   = False
        self.obstacles  = []
        self.camera_x   = 0
        self.next_obs_x = WIDTH + 200
        self.bg_offset  = 0
        self.angle      = 0
        self.auto_jump  = False
 
    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit(); sys.exit()
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    return "menu"
                if event.key == pygame.K_a:
                    self.auto_jump = not self.auto_jump
                if event.key in (pygame.K_SPACE, pygame.K_UP, pygame.K_w):
                    if not self.alive:
                        self.reset()
                        return
                    if not self.started:
                        self.started = True
                    if self.on_ground:
                        self.vy = self.config["jump_force"]
                        self.on_ground = False
        return None
 
    def update(self):
        if not self.started or not self.alive:
            return
 
        self.speed += self.config["speed_inc"]
        self.camera_x += self.speed
        self.bg_offset = (self.bg_offset + self.speed * 0.3) % 80
        self.score += 1
 
        self.vy += self.config["gravity"]
        self.player.y += int(self.vy)
 
        if self.player.y >= GROUND_Y - PLAYER_SIZE:
            self.player.y = GROUND_Y - PLAYER_SIZE
            self.vy = 0
            self.on_ground = True
        else:
            self.on_ground = False
 
        if not self.on_ground:
            self.angle = (self.angle + self.speed * 3) % 360
        else:
            self.angle = 0
 
        while self.next_obs_x - self.camera_x < WIDTH + 100:
            obs = gen_obstacle(self.next_obs_x, self.speed)
            self.obstacles.append(obs)
            gap = random.randint(280, 480)
            self.next_obs_x += gap + obs[-1].right - obs[0].left
 
        self.obstacles = [
            grp for grp in self.obstacles
            if grp[-1].right - self.camera_x > -50
        ]
 
        if self.auto_jump and self.on_ground:
            for grp in self.obstacles:
                obs_x = grp[0].left - self.camera_x
                if 0 < obs_x < 180:
                    self.vy = self.config["jump_force"]
                    self.on_ground = False
                    break
 
        for grp in self.obstacles:
            for rect in grp:
                draw_rect = rect.move(-int(self.camera_x), 0)
                hitbox = self.player.inflate(-6, -6)
                if hitbox.colliderect(draw_rect):
                    self.alive = False
                    self.hi_score = max(self.hi_score, self.score)
 
    def draw_player_shape(self):
        if not self.alive:
            return
        shape = self.config["shape"]
        color = self.config["color"]
        cx, cy = self.player.centerx, self.player.centery
        size = PLAYER_SIZE
 
        surf = pygame.Surface((size + 10, size + 10), pygame.SRCALPHA)
        sc = size // 2
 
        if shape == "cuadrado":
            pygame.draw.rect(surf, color, (5, 5, size, size), border_radius=4)
            pygame.draw.line(surf, (max(color[0]-55,0), max(color[1]-55,0), max(color[2]-55,0)),
                             (11, 11), (size - 1, 11), 2)
        elif shape == "circulo":
            pygame.draw.circle(surf, color, (sc + 5, sc + 5), sc)
            pygame.draw.circle(surf, (min(color[0]+60,255), min(color[1]+60,255), min(color[2]+60,255)),
                               (sc + 5, sc + 5), sc, 2)
        elif shape == "triangulo":
            pts = [(sc + 5, 5), (5, size + 5), (size + 5, size + 5)]
            pygame.draw.polygon(surf, color, pts)
            pygame.draw.polygon(surf, (min(color[0]+60,255), min(color[1]+60,255), min(color[2]+60,255)),
                                pts, 2)
 
        rotated = pygame.transform.rotate(surf, -self.angle)
        rect = rotated.get_rect(center=(cx, cy))
        self.screen.blit(rotated, rect)
 
    def draw_bg(self):
        self.screen.fill(BG_COLOR)
        for x in range(-int(self.bg_offset) % 80, WIDTH, 80):
            pygame.draw.line(self.screen, GRID_COLOR, (x, 0), (x, HEIGHT))
        for y in range(0, HEIGHT, 80):
            pygame.draw.line(self.screen, GRID_COLOR, (0, y), (WIDTH, y))
 
    def draw_ground(self):
        pygame.draw.rect(self.screen, GROUND_COLOR, (0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y))
        pygame.draw.line(self.screen, ACCENT_COLOR, (0, GROUND_Y), (WIDTH, GROUND_Y), 2)
 
    def draw_obstacles(self):
        for grp in self.obstacles:
            for rect in grp:
                draw_rect = rect.move(-int(self.camera_x), 0)
                draw_triangle_obs(self.screen, OBSTACLE_COLOR, draw_rect)
 
    def draw_hud(self):
        score_surf = self.font_med.render(f"SCORE  {self.score // 10:05d}", True, TEXT_COLOR)
        hi_surf    = self.font_small.render(f"BEST  {self.hi_score // 10:05d}", True, ACCENT_COLOR)
        spd_surf   = self.font_small.render(f"SPD  {self.speed:.1f}", True, GROUND_COLOR)
        esc_surf   = self.font_small.render("ESC = menú", True, (60, 60, 100))
        self.screen.blit(score_surf, (20, 16))
        self.screen.blit(hi_surf,    (20, 46))
        self.screen.blit(spd_surf,   (WIDTH - 140, 16))
        self.screen.blit(esc_surf,   (WIDTH - 140, 36))
        if self.auto_jump:
            cheat = self.font_small.render("AUTO [A]", True, (255, 80, 80))
            self.screen.blit(cheat, (WIDTH - 140, 56))
 
    def draw_screens(self):
        if not self.started and self.alive:
            title = self.font_big.render("GeometrySlide", True, self.config["color"])
            hint  = self.font_med.render("SPACE / ↑ para empezar", True, TEXT_COLOR)
            self.screen.blit(title, title.get_rect(center=(WIDTH//2, HEIGHT//2 - 50)))
            self.screen.blit(hint,  hint.get_rect(center=(WIDTH//2, HEIGHT//2 + 20)))
 
        if not self.alive:
            over  = self.font_big.render("GAME OVER", True, OBSTACLE_COLOR)
            score = self.font_med.render(f"Score: {self.score // 10}", True, TEXT_COLOR)
            retry = self.font_med.render("SPACE para reintentar  |  ESC para menú", True, ACCENT_COLOR)
            self.screen.blit(over,  over.get_rect(center=(WIDTH//2, HEIGHT//2 - 60)))
            self.screen.blit(score, score.get_rect(center=(WIDTH//2, HEIGHT//2)))
            self.screen.blit(retry, retry.get_rect(center=(WIDTH//2, HEIGHT//2 + 50)))
 
    def run(self):
        while True:
            result = self.handle_events()
            if result == "menu":
                return
            self.update()
            self.draw_bg()
            self.draw_ground()
            self.draw_obstacles()
            self.draw_player_shape()
            self.draw_hud()
            self.draw_screens()
            pygame.display.flip()
            self.clock.tick(FPS)
 
 
# ── Entry point ────────────────────────────────────────────────────────────
def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("GeometrySlide")
 
    fonts = (
        pygame.font.SysFont("monospace", 48, bold=True),
        pygame.font.SysFont("monospace", 24, bold=True),
        pygame.font.SysFont("monospace", 16),
    )
 
    config = {
        "shape":      "cuadrado",
        "color":      PALETTE[0],
        "base_speed": BASE_SPEED,
        "gravity":    GRAVITY,
        "jump_force": JUMP_FORCE,
        "speed_inc":  SPEED_INC,
    }
 
    while True:
        action = MainMenu(screen, fonts).run()
        if action == "apariencia":
            AparienciaMenu(screen, fonts, config).run()
        elif action == "personalizar":
            PersonalizarMenu(screen, fonts, config).run()
        elif action == "jugar":
            Game(screen, fonts, config).run()
 
if __name__ == "__main__":
    main()
 
