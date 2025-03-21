import os
import requests
import time
import re
from datetime import timedelta
from functools import partial
from cachetools import TTLCache, cached
from cachetools.keys import hashkey
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import feedparser
from dotenv import load_dotenv
# from helpers import get_article_text

load_dotenv()
NEWS_API_KEY = os.getenv("NEWS_KEY")
if not NEWS_API_KEY:
    raise RuntimeError("NEWS_API_KEY is not set. Please check your environment variables.")

router = APIRouter(
    prefix="/news",
    tags=["news"],
    responses={404: {"description": "Not found"}}
)
cache_day = TTLCache(maxsize=1024, ttl=timedelta(days=1).total_seconds(), timer=time.time)

THE_GUARDIAN_URL = "https://content.guardianapis.com"
THE_GUARDIAN_SECTIONS = ["culture", "politics", "society"]


class Article(BaseModel):
    title: str
    summary: str
    link: str
    # text: Optional[str] = None

class TheGuardianResponse(BaseModel):
    section: str
    articles: List[Article]

class NewsFeedResponse(BaseModel):
    elPais: List[Article]
    theGuardian: Dict[str, List[Article]]

PATTERN = r"<strong>.*?</strong>"

@cached(cache_day, key=partial(hashkey, 'theguardian'))
def get_news_the_guardian():
    """Get the news from The Guardian"""
    news = {section: [] for section in THE_GUARDIAN_SECTIONS}
    
    for section in THE_GUARDIAN_SECTIONS:
        endpoint = f"{THE_GUARDIAN_URL}/search"
        params = {
            "section": section,
            "show-fields": "trailText",
            "page": 1,
            "page-size": 5,  # Limit to 5 articles for this example
            "api-key": NEWS_API_KEY
        }
        response = requests.get(endpoint, params=params, timeout=10)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Error fetching news from The Guardian")
        
        try:
            data = response.json()
            results = data.get("response", {}).get("results", [])
            for article in results:
                title = article.get('webTitle', 'No Title')
                link = article.get('webUrl', '#')
                summary = article.get('fields', {}).get('trailText', 'No Summary')
                summary = re.sub(PATTERN, '', summary)  # Remove <strong> html tags
                news[section].append(Article(title=title, summary=summary, link=link))
        except (KeyError, ValueError) as e:
            raise HTTPException(status_code=500, detail=f"Error parsing The Guardian response: {str(e)}")
    
    return news


@cached(cache_day, key=partial(hashkey, 'elpais'))
def get_news_el_pais():
    """Get the news from El País"""
    feed_url = "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada"
    feed = feedparser.parse(feed_url)
    if feed.bozo:
        raise HTTPException(status_code=500, detail=f"Error parsing El País feed: {feed.bozo_exception}")
    
    news = []
    for entry in feed.entries:
        # text = get_article_text(entry)
        news.append(Article(
            title=entry.title,
            summary=entry.summary,
            link=entry.link,
            # text=text
        ))
    return news


@router.get("/")
def get_all_items() -> NewsFeedResponse:
    """Get all news items from El País and The Guardian"""
    el_pais_news = get_news_el_pais()
    the_guardian_news = get_news_the_guardian()
    return NewsFeedResponse(elPais=el_pais_news, theGuardian=the_guardian_news)