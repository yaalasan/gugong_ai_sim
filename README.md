# 故宫抗震模拟系统
## Ancient Chinese Architecture — AI-Enhanced Earthquake Resilience Simulator

A full-stack seismic simulation platform for imperial palace structures, combining real physics, animated 2D visualisation, and an AI building assessment engine.

---

## Project Structure

```
gugong_ai_sim/
├── frontend/          ← React + TypeScript (Vite)
└── backend/           ← Django + Python physics engine
```

---

## Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/yaalasan/gugong_ai_sim.git
cd gugong_ai_sim
```

### 2. Backend setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env       
python manage.py migrate
python manage.py runserver
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Open
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/
- Admin panel: http://localhost:8000/admin/

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | CSS-in-JS (injected style tag) |
| Physics | JavaScript (requestAnimationFrame, Canvas API) |
| Backend | Django 4.2, Django REST Framework |
| Physics Engine | Python + NumPy |
| AI Predictor | Anthropic Claude API |
| Database | SQLite (dev) |
| Fonts | Ma Shan Zheng, Noto Serif SC, Share Tech Mono |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health/` | Health check |
| POST | `/api/simulate/` | Run physics simulation |
| POST | `/api/predict/` | AI building assessment |
| GET | `/api/history/` | Past simulation runs |
| GET | `/api/predictions/` | Past AI predictions |

---

## Environment Variables

```
```

---

## Team

| Role | Area |
|---|---|
| Physics & Simulation | frontend/src/App.tsx |
| Django Backend | backend/simulator/views.py |
| AI Chatbot | TBD — add to backend/simulator/ |
| Physics Engine | backend/simulator/physics.py |
