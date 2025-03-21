![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Raspberry Pi](https://img.shields.io/badge/Raspberry%20Pi-A22846?style=for-the-badge&logo=raspberry-pi&logoColor=white)

# SmarTablero

I made a dashboard to display things I am too lazy to look up, like weather, events, maybe news or discounted pasta. 
It's deployed on a raspberry pi in my living room.

# Usage

## Environment Variables

### Backend (.env)

-  `WEATHER_KEY`: The API key for the [weather service](https://opendata.aemet.es/centrodedescargas/inicio).
-  `NEWS_KEY`: The API key for the [news service](https://open-platform.theguardian.com/documentation/).


### Frontend (.env)

-  `VITE_BACKEND_URL`: The backend URL. Use `http://localhost:8000` during development

## Run docker

for development:

```bash
docker-compose up --build
```

for production:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```