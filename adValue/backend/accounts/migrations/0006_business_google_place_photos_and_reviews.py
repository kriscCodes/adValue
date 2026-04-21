from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0005_business_business_password_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="business",
            name="google_place_photos",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="business",
            name="google_place_reviews",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
