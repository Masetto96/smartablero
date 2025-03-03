import os
import re
from typing import List, Dict, Any
from functools import partial
from datetime import datetime, timedelta
import requests
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from cachetools import TTLCache, cached
from cachetools.keys import hashkey

load_dotenv()
API_KEY = os.getenv("KEY")
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

cache_hour = TTLCache(maxsize=1024, ttl=timedelta(hours=1), timer=datetime.now)
cache_day = TTLCache(maxsize=1024, ttl=timedelta(days=1), timer=datetime.now)
class ForecastResponse(BaseModel):
    hour: int
    temp: int
    feels_like: int
    rain: str
    humidity: int

class DailyForecastResponse(BaseModel):
    fecha: str
    forecast_hourly: List[ForecastResponse]
    prob_precipitacion: Any
    sunrise: str
    sunset: str
    viento: Any

@app.get("/weather", response_model=List[DailyForecastResponse])
def get_weather():
    """Get the weather forecast for Barcelona"""
    weather = get_weather_aemet_horaria()
    return weather

@app.get("/movies")
def get_movies():
    """Get the moviez schedule from cinemas in barcelona"""
    movies = scrape_zumzeig()
    return {"status": 200, "data": movies[:15]}

@app.get("/events")
def get_events():
    """Get the events happening in Barcelona"""
    events_marula = scrape_marula()
    return {"status": 200, "data": events_marula[:15]}

@cached(cache_day, key=partial(hashkey, 'marula'))
def scrape_marula():
    """Scraping the website of Marula Café Barcelona to get the events"""
    url = "https://marulacafe.com/bcn/" 
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        dates = soup.find_all('em', class_='date')
        months = soup.find_all('em', class_='month')
        event_titles = soup.find_all('span', class_='evcal_desc2 evcal_event_title')
        event_subtitles = soup.find_all('span', class_='evcal_event_subtitle')
        all_events = []

        for idx, date in enumerate(dates):
            current_date = date.text.strip()
            event = {
                "title": event_titles[idx].text.strip(),
                "date": f"{current_date} {months[idx].text.strip()}",
                "subtitle": event_subtitles[idx].text.strip(),
            }
            all_events.append(event)

        return all_events
    
    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Failed to fetch events data: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@cached(cache_hour, key=partial(hashkey, 'weather'))
def get_weather_aemet_horaria():
    """Calls the AEMET API to get the weather forecast for Barcelona"""
    CODIGO_MUNICIPIO = "08019" # 08019 is the code for Barcelona
    try:
        url_aemet = f"https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/horaria/{CODIGO_MUNICIPIO}" 
        querystring = {"api_key": API_KEY}
        headers = {'cache-control': "no-cache"}
        
        response_aemet = requests.get(url_aemet, headers=headers, params=querystring, timeout=10)
        response_aemet.raise_for_status()
        aemet_data = response_aemet.json()
        datos_url = aemet_data.get("datos")

        response_datos = requests.get(datos_url, timeout=10)
        response_datos.raise_for_status()
        datos_json = response_datos.json()
        # this is where the actual prediction for each day is, the rest is metadata
        days = datos_json[0].get("prediccion").get("dia")

        forecast_by_date = {}

        for day in days:
            fecha = day.get("fecha")[:10] # Get only the date part
            orto = day.get("orto")
            ocaso = day.get("ocaso")
            temperatura = day.get("temperatura")
            feels_like = day.get("sensTermica")
            precipitation = day.get("precipitacion")
            prob_precipitacion = day.get("probPrecipitacion")
            humedad = day.get("humedadRelativa")
            viento = day.get("vientoAndRachaMax")
            forecast_by_date[fecha] = {"fecha": fecha, "forecast_hourly": [], "prob_precipitacion": prob_precipitacion, "sunrise": orto, "sunset": ocaso, "viento": viento}
            for idx, temp in enumerate(temperatura):
                # probably one of the ugliest code I've ever written
                # it is handling the case in which the hour of temperature data does not match the precipitation data
                if temp.get("periodo") != feels_like[idx].get("periodo") or temp.get("periodo") != humedad[idx].get("periodo"):
                    raise HTTPException(status_code=500, detail="ServerError: periodo is not the same")
                try:
                    if temp.get("periodo") != precipitation[idx].get("periodo"):
                        if temp.get("periodo") == precipitation[idx+1].get("periodo"):
                            prec_val = precipitation[idx+1].get("value")
                        else:
                            prec_val = precipitation[idx].get("value")
                    else:
                        prec_val = precipitation[idx].get("value")
                except IndexError:
                    prec_val = None
                
                temp_val = temp.get("value")
                sens_val = feels_like[idx].get("value")
                hum = humedad[idx].get("value")
                hour = temp.get("periodo")
                forecast_data = {"hour": int(hour), "temp": temp_val, "feels_like": sens_val, "rain": prec_val, "humidity": hum} 
                forecast_by_date[fecha]["forecast_hourly"].append(forecast_data)
        return forecast_by_date.values()
    
    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Failed to fetch weather data: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    
@cached(cache_day, key=partial(hashkey, 'zumzeig'))
def scrape_zumzeig() -> List[Dict]:
    """Scraping the website of Zumzeig Cine Cooperativa to get the moviez schedule"""
    try:
        url = "https://zumzeigcine.coop/es/cine/sesiones/"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        response.encoding = 'utf-8'
        
        soup = BeautifulSoup(response.content, 'html.parser')
        movie_titles = soup.find_all('h2', class_=re.compile(r'^filmtitle'))
        directors = soup.find_all('div', class_='autor')
        sessions = soup.find_all('span', class_='sessions')
        
        movies = []
        for idx, title in enumerate(movie_titles):
            movie = {
                "title": title.get_text(strip=True),
                "director": directors[idx].get_text(strip=True),
                "sessions": [] # movies can have multiple sessions, duh
            }
            
            session_times = sessions[idx].find_all('div', class_='session')
            if not session_times: # this is the case when entrades properament a la venda
                # directors.pop(idx+1)
                # movies.append(movie)
                continue
                
            for session_time in session_times:
                date_time_str = session_time.get_text(strip=True)
                match = re.search(r'(\w{2}) (\d{1,2}\.\d{1,2}\.\d{1,2})\((\d{2}:\d{2})\)', date_time_str)
                if match:
                    day_of_week, date_str, time_str = match.groups()
                    # TODO filter movies after 19:00h on weekdays
                    movie["sessions"].append({
                        "day": f"{day_of_week} {date_str.rstrip('.25')}",
                        "time": time_str
                    })

            movies.append(movie)
        return movies
        
    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Failed to fetch movie data: {str(e)}") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") from e

