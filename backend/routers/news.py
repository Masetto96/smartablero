import os
import random
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from cachetools import TTLCache, cached
from cachetools.keys import hashkey
import requests
from dotenv import load_dotenv

load_dotenv()
GUARDIAN_API_KEY = os.getenv("GUARDIAN_API_KEY")


router = APIRouter()

# Cache for 30 minutes since news updates frequently
cache_30min = TTLCache(maxsize=1024, ttl=timedelta(minutes=30), timer=datetime.now)

BASE_URL = "https://content.guardianapis.com"


class Article(BaseModel):
    title: str
    url: str
    summary: Optional[str] = None
    section: Optional[str] = None
    published_date: Optional[str] = None


class NewsResponse(BaseModel):
    articles: List[Article]
    total: int
    section: Optional[str] = None


def custom_hashkey(*args, **kwargs):
    """Custom hash key for caching"""
    return hashkey(*args, **kwargs)


@cached(cache_30min, key=custom_hashkey)
def fetch_guardian_news(
    section: Optional[str] = None,
    query: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> dict:
    """
    Fetch news articles from The Guardian API.

    Args:
        section: Section ID to filter by (e.g., 'culture', 'politics', 'society')
        query: Search query string
        page: Page number
        page_size: Number of articles per page

    Returns:
        Dictionary containing the API response

    Raises:
        HTTPException: If the request fails
    """
    if not GUARDIAN_API_KEY:
        raise HTTPException(status_code=500, detail="GUARDIAN_API_KEY not configured")

    endpoint = f"{BASE_URL}/search"
    params = {
        "show-fields": "trailText",
        "page": page,
        "page-size": page_size,
        "api-key": GUARDIAN_API_KEY,
    }

    if section:
        params["section"] = section

    if query:
        params["q"] = query

    try:
        response = requests.get(endpoint, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch news from The Guardian: {str(e)}"
        )


@router.get("/news", response_model=NewsResponse, tags=["news"])
def get_news(
    section: Optional[str] = Query(
        None,
        description="Section to filter by (e.g., 'culture', 'politics', 'society')",
    ),
    query: Optional[str] = Query(None, description="Search query"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=50, description="Number of articles per page"),
):
    """
    Get news articles from The Guardian API.

    - **section**: Optional section filter (culture, politics, society, etc.)
    - **query**: Optional search query
    - **page**: Page number (default: 1)
    - **page_size**: Number of articles per page (default: 20, max: 50)
    """
    data = fetch_guardian_news(section, query, page, page_size)
    
    articles = []
    for article_data in data.get("response", {}).get("results", []):
        article = Article(
            title=article_data.get("webTitle", ""),
            url=article_data.get("webUrl", ""),
            summary=article_data.get("fields", {}).get("trailText"),
            section=article_data.get("sectionName"),
            published_date=article_data.get("webPublicationDate"),
        )
        articles.append(article)

    # Shuffle the articles
    random.shuffle(articles)

    return NewsResponse(
        articles=articles,
        total=data.get("response", {}).get("total", 0),
        section=section,
    )


@router.get("/news/sections", response_model=List[str], tags=["news"])
def get_available_sections():
    """
    Get a list of commonly used sections for The Guardian news.
    """
    return [
        "culture",
        "politics",
        "society",
        "world",
        "uk-news",
        "science",
        "technology",
        "business",
        "sport",
        "environment",
        "education",
    ]
