from django.db import migrations, models


def seed_hunter_cafeteria(apps, schema_editor):
    ExplorePlace = apps.get_model("accounts", "ExplorePlace")
    ExplorePlace.objects.update_or_create(
        external_id=3,
        defaults={
            "name": "Hunter college cafeteria",
            "latitude": 40.768616,
            "longitude": -73.964763,
            "rating": 4.2,
            "place_type": "Cafeteria",
            "img": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600",
            "address": "695 Park Ave at E 68 St, New York, NY 10065",
        },
    )


def unseed_hunter_cafeteria(apps, schema_editor):
    ExplorePlace = apps.get_model("accounts", "ExplorePlace")
    ExplorePlace.objects.filter(external_id=3).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0009_customer_notifications_enabled"),
    ]

    operations = [
        migrations.CreateModel(
            name="ExplorePlace",
            fields=[
                ("explore_place_id", models.AutoField(primary_key=True, serialize=False)),
                ("external_id", models.IntegerField(unique=True)),
                ("name", models.CharField(max_length=255)),
                ("latitude", models.FloatField()),
                ("longitude", models.FloatField()),
                ("rating", models.FloatField(default=0)),
                ("place_type", models.CharField(blank=True, default="", max_length=120)),
                ("img", models.URLField(blank=True, default="", max_length=500)),
                ("address", models.CharField(blank=True, default="", max_length=300)),
            ],
            options={
                "db_table": "ExplorePlace",
            },
        ),
        migrations.RunPython(seed_hunter_cafeteria, unseed_hunter_cafeteria),
    ]
