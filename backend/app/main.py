from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import applications, stages, info_items

app = FastAPI(
    title="Application Tracker API",
    description="API for tracking job applications",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(applications.router)
app.include_router(info_items.router)
app.include_router(stages.router)


@app.get("/")
def root():
    """Root endpoint."""
    return {"message": "Application Tracker API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
