# Application Tracker

A clean, fast, and simple job application tracker with a Kanban-style board. Keep track of your job applications across different stages.

## Features

- 📋 **Kanban Board**: Visual board with customizable stages (Wishlist, Applied, Interview, Rejected)
- 🎯 **Simple & Clean**: Minimal interface focusing on what matters
- 🚀 **Fast**: Built with FastAPI and Nuxt 3 for optimal performance
- 🐳 **Dockerized**: Easy setup with Docker Compose

## Tech Stack

- **Backend**: FastAPI + PostgreSQL
- **Frontend**: Nuxt 3 + Nuxt UI
- **Database**: PostgreSQL
- **Deployment**: Docker + Docker Compose

## Quick Start

1. **Clone and setup**:
   ```bash
   git clone <your-repo>
   cd app-tracker
   cp .env.example .env
   ```

2. **Start with Docker**:
   ```bash
   docker-compose up -d
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Development

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Database Migrations
```bash
cd backend
alembic upgrade head
```

## API Endpoints

- `GET /applications` - List all applications
- `GET /applications/{id}` - Get specific application
- `POST /applications` - Create new application
- `PUT /applications/{id}` - Update application
- `DELETE /applications/{id}` - Delete application

## Project Structure

```
app-tracker/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── routers/   # API routes
│   │   ├── models.py  # Database models
│   │   ├── schemas.py # Pydantic schemas
│   │   ├── crud.py    # CRUD operations
│   │   └── main.py    # App entry point
│   └── alembic/       # Database migrations
├── frontend/          # Nuxt 3 frontend
│   ├── components/    # Vue components
│   ├── composables/   # Composables
│   └── pages/         # Pages
└── docker-compose.yml # Docker orchestration
```

## License

MIT
