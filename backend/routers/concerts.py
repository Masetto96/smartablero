from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from cachetools import TTLCache, cached
from cachetools.keys import hashkey
import requests
from bs4 import BeautifulSoup
import re

router = APIRouter()

# Cache for 1 hour since concert schedules don't change frequently
cache_hour = TTLCache(maxsize=1024, ttl=timedelta(hours=1), timer=datetime.now)


class ConcertEvent(BaseModel):
    date: str
    description: str
    venue: str
    time: Optional[str] = None
    cost: Optional[str] = None


class ConcertsResponse(BaseModel):
    concerts: List[ConcertEvent]


def custom_hashkey(*args, **kwargs):
    """Custom hash key for caching that ignores self parameter"""
    return hashkey(*args, **kwargs)


def extract_time_and_cost(description: str) -> tuple[Optional[str], Optional[str], str]:
    """
    Extract time and cost from concert description using regex.
    
    Args:
        description: The concert description text
        
    Returns:
        Tuple of (time, cost, cleaned_description)
    """
    time = None
    cost = None
    cleaned_description = description
    
    # Extract time: number followed by "horas"
    # Pattern: matches things like "21 horas", "20:30 horas", etc.
    time_pattern = r'(\d{1,2}(?::\d{2})?)\s*horas?'
    time_match = re.search(time_pattern, description, re.IGNORECASE)
    if time_match:
        time = time_match.group(1)
        # Remove the time part from description
        cleaned_description = re.sub(time_pattern + r',?\s*', '', cleaned_description, flags=re.IGNORECASE)
    
    # Extract cost: number followed by "euros"
    # Pattern: matches things like "15 euros", "15,50 euros", "15.50 euros"
    cost_pattern = r'(\d+(?:[.,]\d{1,2})?)\s*euros?'
    cost_match = re.search(cost_pattern, description, re.IGNORECASE)
    if cost_match:
        cost = cost_match.group(1)
        # Remove the cost part from description (including "Entradas anticipadas" if present)
        cleaned_description = re.sub(r'(?:Entradas?\s+)?(?:anticipadas?\s+)?(?:desde\s+)?' + cost_pattern + r'\.?', '', cleaned_description, flags=re.IGNORECASE)
    
    # Clean up extra whitespace and punctuation
    cleaned_description = re.sub(r'\s+', ' ', cleaned_description).strip()
    cleaned_description = re.sub(r'^[,.\s]+|[,.\s]+$', '', cleaned_description)
    
    return time, cost, cleaned_description


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
        ConcertsResponse: Flat list of all concerts with venue information
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
    
    all_concerts = []
    
    for venue_config in venues_config:
        venue_name = venue_config["name"]
        url = venue_config["url"]
        
        try:
            events = scrape_concerts(url, venue_name)
            # Add venue name to each event and append to the flat list
            for event in events:
                # Extract time and cost from description
                time, cost, cleaned_description = extract_time_and_cost(event["description"])
                
                all_concerts.append(ConcertEvent(
                    date=event["date"],
                    description=cleaned_description,
                    venue=venue_name,
                    time=time,
                    cost=cost
                ))
        except HTTPException as e:
            # Log the error but continue with other venues
            print(f"Error scraping {venue_name}: {e.detail}")
            continue
    
    # Parse and filter concerts by date
    def parse_spanish_date(date_str: str) -> datetime:
        """Parse Spanish date format like 'Viernes 1 noviembre 2024' or '1 noviembre 2024'"""
        spanish_months = {
            "enero": 1, "febrero": 2, "marzo": 3, "abril": 4,
            "mayo": 5, "junio": 6, "julio": 7, "agosto": 8,
            "septiembre": 9, "octubre": 10, "noviembre": 11, "diciembre": 12
        }
        
        # Remove day of week if present (e.g., "Viernes ")
        parts = date_str.lower().split()
        
        # Find day, month, and year
        day = None
        month = None
        year = None
        
        for part in parts:
            # Check if it's a number (day or year)
            if part.isdigit():
                num = int(part)
                if num > 31:  # It's a year
                    year = num
                elif day is None:  # It's a day
                    day = num
            # Check if it's a month
            elif part in spanish_months:
                month = spanish_months[part]
        
        # Default to current year if not specified
        if year is None:
            year = datetime.now().year
        
        if day and month:
            return datetime(year, month, day)
        else:
            # If parsing fails, return a far future date to put it at the end
            return datetime(9999, 12, 31)
    
    # Get yesterday's date (start of yesterday)
    yesterday = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=1)
    
    # Filter out concerts that have already passed (before yesterday)
    upcoming_concerts = [
        concert for concert in all_concerts
        if parse_spanish_date(concert.date) >= yesterday
    ]
    
    # Sort concerts by date
    upcoming_concerts.sort(key=lambda concert: parse_spanish_date(concert.date))
    
    return ConcertsResponse(concerts=upcoming_concerts)
