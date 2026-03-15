# Frontend — React + TypeScript

## Setup
```bash
npm install
npm run dev
```

## Structure
```
src/
└── App.tsx    ← entire simulator (simulation engine, UI, ML predictor)
```

## Chatbot Integration
Add your chatbot component in `src/App.tsx`.
The right panel (`panel-right`) is where the ML predictor lives — add a chat tab or second panel there.

Backend API is at `http://localhost:8000/api/`
