from django.http import JsonResponse
from django.db import connection

# SQL column names (must match test_customer table)
COL_NAME = "customer_name"
COL_EMAIL = "email_address"
COL_BUSINESS = "business_name"
COL_SOCIAL_VIEWS = "social_media_views"

# Keys we use in the API response
KEY_NAME = "name"
KEY_EMAIL = "email"
KEY_BUSINESS = "business"
KEY_SOCIAL_VIEWS = "social_views"


def get_content_creators(request):
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    query = (
        f"SELECT {COL_NAME}, {COL_EMAIL}, {COL_BUSINESS}, {COL_SOCIAL_VIEWS} "
        "FROM test_customer"
    )
    with connection.cursor() as cursor:
        cursor.execute(query)
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()

    data = []
    for row in rows:
        row_dict = dict(zip(columns, row))
        data.append({
            KEY_NAME: row_dict[COL_NAME],
            KEY_EMAIL: row_dict[COL_EMAIL],
            KEY_BUSINESS: row_dict[COL_BUSINESS],
            KEY_SOCIAL_VIEWS: row_dict[COL_SOCIAL_VIEWS],
        })

    return JsonResponse({"content_creators": data})
