from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0006_business_google_place_photos_and_reviews"),
    ]

    operations = [
        migrations.CreateModel(
            name="SavedBusiness",
            fields=[
                ("saved_business_id", models.AutoField(primary_key=True, serialize=False)),
                ("business_external_id", models.IntegerField()),
                ("business_name", models.CharField(max_length=255)),
                ("business_type", models.CharField(blank=True, default="", max_length=120)),
                ("business_img", models.URLField(blank=True, default="")),
                ("business_rating", models.FloatField(default=0)),
                ("business_lat", models.FloatField(default=0)),
                ("business_lng", models.FloatField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "customer",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="saved_businesses",
                        to="accounts.customer",
                    ),
                ),
            ],
            options={
                "db_table": "SavedBusiness",
            },
        ),
        migrations.AddConstraint(
            model_name="savedbusiness",
            constraint=models.UniqueConstraint(
                fields=("customer", "business_external_id"),
                name="unique_saved_business_per_customer",
            ),
        ),
    ]
