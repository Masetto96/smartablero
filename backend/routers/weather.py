import os
import json
import time
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
# Cache for 1 hour since concert schedules don't change frequently
cache_hour = TTLCache(maxsize=1024, ttl=timedelta(hours=0.5), timer=datetime.now)

router = APIRouter()

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

class CurrentWeatherResponse(BaseModel):
    temp: Optional[int]
    feels_like: Optional[int]
    sky: Optional[str]
    humidity: Optional[int]
    sunrise: Optional[str]
    sunset: Optional[str]
    hour: Optional[int]

class FeelsLikeData(BaseModel):
    hora: Optional[int]
    value: Optional[int]

class SensTermica(BaseModel):
    maxima: Optional[int]
    minima: Optional[int]
    dato: List[FeelsLikeData] = []

class EstadoCielo(BaseModel):
    value: Optional[str]
    periodo: Optional[str]
    descripcion: Optional[str]
    icon: Optional[str]

class DailyWeatherCard(BaseModel):
    fecha: Optional[str]
    sensTermica: Optional[SensTermica]
    probPrecipitacion: List[PrecipitationProbability] = []
    estadoCielo: List[EstadoCielo] = []

@router.get("/weather", response_model=List[DailyForecastResponse])
def get_weather():
    """Get the weather forecast for Barcelona"""
    # get_weather_aemet_horaria returns a list (serializable) for consistency
    weather = get_weather_aemet_horaria()
    return weather

@router.get("/weather/current", response_model=CurrentWeatherResponse)
def get_current_weather():
    """Get the current weather conditions"""
    # get a list from the shared data provider (already a list)
    weather_list = get_weather_aemet_horaria()

    if not weather_list:
        raise HTTPException(status_code=404, detail="No weather data available")

    current_date = datetime.now().strftime("%Y-%m-%d")
    current_hour = datetime.now().hour

    # Find today's data
    today_data = next((day for day in weather_list if day.get("fecha") == current_date), None)
    
    if not today_data or not today_data.get("forecast_hourly"):
        raise HTTPException(status_code=404, detail="No current weather data available")
    
    # Find the current hour's forecast
    current_forecast = next(
        (forecast for forecast in today_data["forecast_hourly"] if forecast["hour"] == current_hour),
        None
    )
    
    # If current hour not found, use the closest available hour
    if not current_forecast and today_data["forecast_hourly"]:
        current_forecast = today_data["forecast_hourly"][0]
    
    if not current_forecast:
        raise HTTPException(status_code=404, detail="No forecast data available")
    
    return CurrentWeatherResponse(
        temp=current_forecast.get("temp"),
        feels_like=current_forecast.get("feels_like"),
        sky=current_forecast.get("sky"),
        humidity=current_forecast.get("humidity"),
        sunrise=today_data.get("sunrise"),
        sunset=today_data.get("sunset"),
        hour=current_forecast.get("hour")
    )

@router.get("/weather/daily", response_model=List[DailyWeatherCard])
def get_daily_weather():
    """Get the daily weather forecast for Sevilla (excluding today since we have hourly data)"""
    daily_forecast = get_weather_aemet_diaria()
    return daily_forecast

def _fetch_aemet_data_with_retry(max_retries=3, base_delay=2, timeout=20):
    """Fetch data from AEMET API with retry logic and exponential backoff"""
    CODIGO_MUNICIPIO = "41091"  # 41091 is the code for Sevilla
    url_aemet = f"https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/horaria/{CODIGO_MUNICIPIO}"
    querystring = {"api_key": API_KEY}
    headers = {'cache-control': "no-cache"}
    
    last_exception = None
    
    for attempt in range(max_retries):
        try:
            # First API call to get the data URL
            response_aemet = requests.get(url_aemet, headers=headers, params=querystring, timeout=timeout)
            response_aemet.raise_for_status()
            aemet_data = response_aemet.json()
            datos_url = aemet_data.get("datos")
            
            if not datos_url:
                raise ValueError("No data URL returned from AEMET API")
            
            # Second API call to get actual data
            response_datos = requests.get(datos_url, timeout=timeout)
            response_datos.raise_for_status()
            return response_datos.json()
            
        except (requests.RequestException, ValueError) as e:
            last_exception = e
            if attempt < max_retries - 1:
                delay = base_delay * (2 ** attempt)  # Exponential backoff: 2, 4, 8 seconds
                time.sleep(delay)
    
    # If all retries failed, raise the last exception
    raise last_exception

@cached(cache_hour, key=partial(hashkey, 'weather_horaria'))
def get_weather_aemet_horaria():
    """Calls the AEMET API to get the weather forecast for Sevilla"""
    try:
        datos_json = _fetch_aemet_data_with_retry()
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

        # Return a list so callers (and cache) get a serializable structure
        return list(forecast_by_date.values())

    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Failed to fetch weather data: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

def _fetch_aemet_data_diaria_with_retry(max_retries=3, base_delay=2, timeout=20):
    """Fetch daily data from AEMET API with retry logic and exponential backoff"""
    CODIGO_MUNICIPIO = "41091"  # 41091 is the code for Sevilla
    url_aemet = f"https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/{CODIGO_MUNICIPIO}"
    querystring = {"api_key": API_KEY}
    headers = {'cache-control': "no-cache"}
    
    last_exception = None
    
    for attempt in range(max_retries):
        try:
            # First API call to get the data URL
            response_aemet = requests.get(url_aemet, headers=headers, params=querystring, timeout=timeout)
            response_aemet.raise_for_status()
            aemet_data = response_aemet.json()
            datos_url = aemet_data.get("datos")

            if not datos_url:
                raise ValueError("No data URL returned from AEMET API")
            
            # Second API call to get actual data
            response_datos = requests.get(datos_url, timeout=timeout)
            response_datos.raise_for_status()
            return response_datos.json()
            
        except (requests.RequestException, ValueError) as e:
            last_exception = e
            if attempt < max_retries - 1:
                delay = base_delay * (2 ** attempt)  # Exponential backoff: 2, 4, 8 seconds
                time.sleep(delay)
    
    # If all retries failed, raise the last exception
    raise last_exception

@cached(cache_hour, key=partial(hashkey, 'weather_diaria'))
def get_weather_aemet_diaria():
    """Calls the AEMET API to get the daily weather forecast for Sevilla"""
    try:
        datos_json = _fetch_aemet_data_diaria_with_retry()
        
        # Parse the daily data
        days = datos_json[0].get("prediccion", {}).get("dia", [])
        
        result = []
        current_date = datetime.now().strftime("%Y-%m-%d")
        
        for day in days:
            fecha = day.get("fecha", "").split("T")[0]
            
            # Skip today since we already have hourly data for it
            if fecha == current_date:
                continue
            
            # Parse sensTermica (feels like temperature)
            sens_termica_raw = day.get("sensTermica", {})
            sens_termica_dato = []
            
            if sens_termica_raw.get("dato"):
                sens_termica_dato = [
                    {"hora": item.get("hora"), "value": item.get("value")}
                    for item in sens_termica_raw.get("dato", [])
                ]
            
            sens_termica = {
                "maxima": sens_termica_raw.get("maxima"),
                "minima": sens_termica_raw.get("minima"),
                "dato": sens_termica_dato
            }
            
            # Parse probPrecipitacion (filter out "00-24" entries)
            prob_precipitacion = [
                {"value": item.get("value"), "periodo": item.get("periodo")}
                for item in day.get("probPrecipitacion", [])
                if item.get("periodo") != "00-24"
            ]
            
            # Parse estadoCielo and map descriptions to icons (filter out "00-24" entries)
            estado_cielo = []
            for item in day.get("estadoCielo", []):
                periodo = item.get("periodo", "")
                if periodo == "00-24":
                    continue
                    
                descripcion = item.get("descripcion", "")
                estado_cielo.append({
                    "value": item.get("value", ""),
                    "periodo": periodo,
                    "descripcion": descripcion,
                    "icon": SKY_ICON_MAPPING.get(descripcion)
                })
            
            result.append({
                "fecha": fecha,
                "sensTermica": sens_termica,
                "probPrecipitacion": prob_precipitacion,
                "estadoCielo": estado_cielo
            })
        
        return result

    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Failed to fetch daily weather data: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
