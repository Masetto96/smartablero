import os
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

load_dotenv()
API_KEY = os.getenv("KEY")

@app.get("/weather")
async def get_weather():
    """Get the weather forecast for Barcelona"""
    try:
        url_aemet = "https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/horaria/08019" # 08019 is the code for Barcelona
        querystring = {"api_key": API_KEY}
        headers = {'cache-control': "no-cache"}
        
        response_aemet = requests.get(url_aemet, headers=headers, params=querystring, timeout=10)
        response_aemet.raise_for_status()
        aemet_data = response_aemet.json()
        datos_url = aemet_data.get("datos")

        response_datos = requests.get(datos_url, timeout=10)
        response_datos.raise_for_status()
        datos_json = response_datos.json()
        days = datos_json[0].get("prediccion").get("dia")

        response = {"status": 200, "data": []}
        forecast_by_date = {}

        for day in days:
            fecha = day.get("fecha")[:10] # Get only the date part
            temperatura = day.get("temperatura")
            feels_like = day.get("sensTermica")
            precipitation = day.get("precipitacion")
            prob_precipitacion = day.get("probPrecipitacion")
            forecast_by_date[fecha] = {"fecha": fecha, "forecast_hourly": [], "prob_precipitacion": prob_precipitacion}
            for temp, sens, prec in zip(temperatura, feels_like, precipitation):
                # TODO: check is periodo of temp, sens and prec is the same
                # if temp.get("periodo") != sens.get("periodo") or temp.get("periodo") != prec.get("periodo"):
                #     raise HTTPException(status_code=500, detail="ServerError: periodo is not the same")
                temp_val = temp.get("value")
                sens_val = sens.get("value")
                prec_val = prec.get("value")
                hour = temp.get("periodo") # TODO: check that periodo is the same for all the values
                forecast_data = {"hour": hour, "temp": temp_val, "feels_like": sens_val, "rain": prec_val}
                forecast_by_date[fecha]["forecast_hourly"].append(forecast_data)
        # TODO: is there a more efficient way to do this?
        response["data"] = list(forecast_by_date.values())
        return response
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"ServerError: {e}") from e