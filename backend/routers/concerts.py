from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from cachetools import TTLCache, cached
from cachetools.keys import hashkey
import requests
from bs4 import BeautifulSoup

router = APIRouter()

# Cache for 1 hour since concert schedules don't change frequently
cache_hour = TTLCache(maxsize=1024, ttl=timedelta(hours=1), timer=datetime.now)


class ConcertEvent(BaseModel):
    date: str
    description: str


class VenueEvents(BaseModel):
    events: List[ConcertEvent]


class ConcertsResponse(BaseModel):
    venues: dict[str, VenueEvents]


def custom_hashkey(*args, **kwargs):
    """Custom hash key for caching that ignores self parameter"""
    return hashkey(*args, **kwargs)


@cached(cache_hour, key=custom_hashkey)
def scrape_concerts(url: str, venue: str) -> List[dict]:
    """
    Scrape concert events from OnSevilla website.
    
    Args:
        url: The URL to scrape concert information from
        venue: The name of the venue
        
    Returns:
        List of dictionaries containing date, description, and venue of events
        
    Raises:
        HTTPException: If the request fails or parsing encounters an error
    """
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch concert data: {str(e)}")
    
    try:
        soup = BeautifulSoup(response.content, "html.parser")
        
        # The main div that contains the programacion
        programacion_anchor = soup.find("a", {"name": "programacion"})
        if not programacion_anchor:
            raise HTTPException(status_code=404, detail="Programacion section not found on page")
        
        # Get the parent container that has all the content
        parent_container = programacion_anchor.parent
        if not parent_container:
            raise HTTPException(status_code=404, detail="Parent container not found on page")
        
        events = []
        
        # Spanish months for date detection
        spanish_months = [
            "enero", "febrero", "marzo", "abril", "mayo", "junio",
            "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
        ]
        
        # Traverse all descendants to find dates and their associated events
        for element in parent_container.descendants:
            if element.name == "strong":
                text = element.get_text(strip=True)
                # Check if it's a date (format: day + month + year)
                if any(month in text.lower() for month in spanish_months):
                    current_date = text
                    
                    # Look for the event description in the next sibling
                    next_sibling = element.next_sibling
                    attempts = 0
                    while next_sibling and attempts < 10:
                        if isinstance(next_sibling, str):
                            desc = next_sibling.strip()
                            if desc.startswith("·"):
                                # Remove leading dot and whitespace
                                desc = desc[1:].strip()
                                if desc:
                                    events.append({
                                        "date": current_date,
                                        "description": desc
                                    })
                                    break
                        elif next_sibling.name == "strong":
                            # Next date found, stop looking
                            break
                        
                        next_sibling = next_sibling.next_sibling
                        attempts += 1
        
        return events
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing concert data: {str(e)}")


@router.get("/concerts", response_model=ConcertsResponse)
async def get_concerts():
    """
    Get the list of upcoming concerts from multiple venues in Sevilla.
    
    Returns:
        ConcertsResponse: Dictionary with venue names as keys and their events
    """
    venues_config = [
        {
            "name": "Sala X",
            "url": "https://onsevilla.com/programacion-sala-x-sevilla"
        },
        {
            "name": "Sala Even",
            "url": "https://onsevilla.com/programacion-sala-even-sevilla"
        }
    ]
    
    venues_dict = {}
    
    for venue_config in venues_config:
        venue_name = venue_config["name"]
        url = venue_config["url"]
        
        try:
            events = scrape_concerts(url, venue_name)
            venues_dict[venue_name] = VenueEvents(
                events=[ConcertEvent(**event) for event in events]
            )
        except HTTPException as e:
            # Log the error but continue with other venues
            print(f"Error scraping {venue_name}: {e.detail}")
            # Add empty events list for this venue
            venues_dict[venue_name] = VenueEvents(events=[])
            continue
    
    return ConcertsResponse(venues=venues_dict)
