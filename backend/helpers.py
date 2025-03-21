from bs4 import BeautifulSoup

def get_article_text(entry):
    # Extract the article text from the entry
    contents = entry.get("content", [])
    if not contents:
        return None

    # Use the second element if available, otherwise the first one.
    if len(contents) > 1:
        article_html = contents[1].get("value", "")
    else:
        article_html = contents[0].get("value", "")

    # Remove HTML tags using BeautifulSoup
    soup = BeautifulSoup(article_html, "html.parser")
    article_text = soup.get_text()
    return article_text
