# DashCube 🟨

A Geometry Dash-style endless runner built with Python and Pygame.  
Jump over procedurally generated spike obstacles — the longer you survive, the faster it gets.

![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)
![Pygame](https://img.shields.io/badge/Pygame-2.6-green)
![Docker](https://img.shields.io/badge/Docker-ready-blue?logo=docker)

---

## Gameplay

- **Space / ↑ / W** — Jump
- Avoid the red spikes (1, 2 or 3 at a time)
- Speed increases the longer you survive
- Beat your high score!

---

## Run locally (Python)

**Requirements:** Python 3.10+

```bash
pip install -r requirements.txt
python game.py
```

---

## Run with Docker 🐳

### Linux

```bash
# Allow Docker to access your display
xhost +local:docker

# Build and run
docker compose up --build

# Revoke display access when done
xhost -local:docker
```

### Windows (WSL2 or VcXsrv)

1. Install [VcXsrv](https://sourceforge.net/projects/vcxsrv/) and launch it with:
   - Multiple windows ✔
   - Start no client ✔
   - **Disable access control ✔**

2. In PowerShell or WSL2:
```bash
export DISPLAY=host.docker.internal:0
docker compose up --build
```

### macOS (XQuartz)

1. Install [XQuartz](https://www.xquartz.org/)
2. In XQuartz preferences → Security → enable **"Allow connections from network clients"**
3. Restart XQuartz, then:
```bash
xhost +localhost
export DISPLAY=:0
docker compose up --build
```

---

## Project structure

```
dashcube/
├── game.py              # Game source
├── requirements.txt     # Python dependencies
├── Dockerfile           # Container definition
├── docker-compose.yml   # Easy run command
├── .gitignore
└── README.md
```

---

## Built with

- [Python 3.12](https://www.python.org/)
- [Pygame 2.6](https://www.pygame.org/)
