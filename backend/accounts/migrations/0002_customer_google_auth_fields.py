from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="customer",
            name="auth_provider",
            field=models.CharField(default="local", max_length=20),
        ),
        migrations.AddField(
            model_name="customer",
            name="email_verified",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="customer",
            name="google_subject_id",
            field=models.CharField(blank=True, max_length=255, null=True, unique=True),
        ),
    ]
