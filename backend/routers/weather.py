import os
import json
from typing import List, Optional, Any
from functools import partial
from datetime import datetime, timedelta
import requests
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv
from cachetools import TTLCache, cached
from cachetools.keys import hashkey

load_dotenv()
API_KEY = os.getenv("WEATHER_KEY")

router = APIRouter()

cache_hour = TTLCache(maxsize=1024, ttl=timedelta(hours=1), timer=datetime.now)

class PrecipitationProbability(BaseModel):
    value: Optional[int]
    periodo: Optional[str]

class ForecastResponse(BaseModel):
    hour: Optional[int]
    temp: Optional[int]
    feels_like: Optional[int]
    sky: Optional[str]
    rain: Optional[str]
    humidity: Optional[int]

class DailyForecastResponse(BaseModel):
    fecha: Optional[str]
    forecast_hourly: List[ForecastResponse] = []
    prob_precipitacion: List[PrecipitationProbability] = []
    sunrise: Optional[str]
    sunset: Optional[str]
    viento: Optional[Any]

# Load sky icon mapping
_current_dir = os.path.dirname(os.path.abspath(__file__))
_sky_icon_path = os.path.join(os.path.dirname(_current_dir), 'sky_icon_mapping.json')
with open(_sky_icon_path, 'r', encoding='utf-8') as f:
    SKY_ICON_MAPPING = json.load(f)

@router.get("/weather", response_model=List[DailyForecastResponse])
def get_weather():
    """Get the weather forecast for Barcelona"""
    weather = get_weather_aemet_horaria()
    return weather

@cached(cache_hour, key=partial(hashkey, 'weather'))
def get_weather_aemet_horaria():
    """Calls the AEMET API to get the weather forecast for Sevilla"""
    CODIGO_MUNICIPIO = "41091"  # 41091 is the code for Sevilla
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
            fecha = day.get("fecha")[:10]  # Get only the date part
            orto = day.get("orto")
            ocaso = day.get("ocaso")
            temperatura = day.get("temperatura")
            feels_like = day.get("sensTermica")
            precipitation = day.get("precipitacion")
            prob_precipitacion = day.get("probPrecipitacion")
            humedad = day.get("humedadRelativa")
            viento = day.get("vientoAndRachaMax")
            cielo = day.get("estadoCielo")
            forecast_by_date[fecha] = {
                "fecha": fecha,
                "forecast_hourly": [],
                "prob_precipitacion": prob_precipitacion,
                "sunrise": orto,
                "sunset": ocaso,
                "viento": viento
            }
            temp_dict = {item['periodo']: item['value'] for item in temperatura}
            feels_like_dict = {item['periodo']: item['value'] for item in feels_like}
            precipitation_dict = {item['periodo']: item['value'] for item in precipitation}
            humedad_dict = {item['periodo']: item['value'] for item in humedad}
            cielo_dict = {item['periodo']: item['descripcion'] for item in cielo}
            
            # Merge all data on periodo
            merged_data = [
                {
                    'hour': int(periodo),
                    'temp': temp_dict.get(periodo),
                    'feels_like': feels_like_dict.get(periodo),
                    'rain': precipitation_dict.get(periodo),
                    'humidity': humedad_dict.get(periodo),
                    'sky': SKY_ICON_MAPPING.get(cielo_dict.get(periodo))
                }
                for periodo in temp_dict.keys()
            ]

            forecast_by_date[fecha]["forecast_hourly"].extend(merged_data)

        return forecast_by_date.values()
    
    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Failed to fetch weather data: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
