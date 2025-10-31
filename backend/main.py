from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import weather, concerts, news

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Change this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(weather.router)
app.include_router(concerts.router)
app.include_router(news.router)