from urllib.parse import urlencode

import requests
from django.conf import settings


PLACES_DETAILS_URL = "https://places.googleapis.com/v1/places/{place_id}"
PLACES_PHOTO_MEDIA_URL = "https://places.googleapis.com/v1/{photo_name}/media"
PLACES_AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete"


def _google_headers(field_mask=""):
    api_key = getattr(settings, "GOOGLE_PLACES_API_KEY", "")
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
    }
    if field_mask:
        headers["X-Goog-FieldMask"] = field_mask
    return headers


def build_google_places_photo_url(photo_reference, max_width=800):
    """
    Return a Google Places photo URL safe to use in frontend <img src>.
    """
    api_key = getattr(settings, "GOOGLE_PLACES_API_KEY", "")
    if not photo_reference or not api_key:
        return ""

    # Places API (New): photo reference is a photo resource name like
    # "places/PLACE_ID/photos/PHOTO_RESOURCE".
    if photo_reference.startswith("places/"):
        query = urlencode({"maxWidthPx": max_width, "key": api_key})
        return f"{PLACES_PHOTO_MEDIA_URL.format(photo_name=photo_reference)}?{query}"

    # Legacy fallback if caller still passes legacy photo_reference.
    query = urlencode({"maxwidth": max_width, "photo_reference": photo_reference, "key": api_key})
    return f"https://maps.googleapis.com/maps/api/place/photo?{query}"


def fetch_google_place_content(place_id):
    """
    Fetch photos and reviews for a place_id and return normalized data.
    """
    api_key = getattr(settings, "GOOGLE_PLACES_API_KEY", "")
    if not place_id or not api_key:
        return {"photos": [], "reviews": []}

    response = requests.get(
        PLACES_DETAILS_URL.format(place_id=place_id),
        headers=_google_headers("photos,reviews"),
        timeout=10,
    )
    response.raise_for_status()
    payload = response.json()

    photos = []
    for photo in payload.get("photos", []):
        photo_reference = photo.get("name")
        photo_url = build_google_places_photo_url(photo_reference)
        if photo_url:
            photos.append(
                {
                    "photo_reference": photo_reference,
                    "url": photo_url,
                    "width": photo.get("widthPx"),
                    "height": photo.get("heightPx"),
                }
            )

    reviews = []
    for review in payload.get("reviews", []):
        reviews.append(
            {
                "author_name": review.get("authorAttribution", {}).get("displayName", ""),
                "rating": review.get("rating"),
                "text": review.get("text", {}).get("text", ""),
                "relative_time_description": review.get("relativePublishTimeDescription", ""),
                "time": review.get("publishTime"),
            }
        )

    return {"photos": photos, "reviews": reviews}


def fetch_place_autocomplete(query, limit=5):
    """
    Return autocomplete predictions with description + place_id.
    """
    api_key = getattr(settings, "GOOGLE_PLACES_API_KEY", "")
    if not query or not api_key:
        return []

    response = requests.post(
        PLACES_AUTOCOMPLETE_URL,
        headers=_google_headers("suggestions.placePrediction.placeId,suggestions.placePrediction.text.text"),
        json={"input": query},
        timeout=10,
    )
    response.raise_for_status()
    payload = response.json()
    suggestions = payload.get("suggestions", [])
    normalized = []
    for suggestion in suggestions[:limit]:
        prediction = suggestion.get("placePrediction", {})
        normalized.append(
            {
                "description": prediction.get("text", {}).get("text", ""),
                "place_id": prediction.get("placeId", ""),
            }
        )
    return normalized
